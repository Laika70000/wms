-- Create roles table
CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create permissions table
CREATE TABLE permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL UNIQUE,
  description text,
  resource text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create role_permissions junction table
CREATE TABLE role_permissions (
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (role_id, permission_id)
);

-- Create user_roles junction table
CREATE TABLE user_roles (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, role_id)
);

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow admin access to roles"
  ON roles
  FOR ALL
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Allow admin access to permissions"
  ON permissions
  FOR ALL
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Allow admin access to role_permissions"
  ON role_permissions
  FOR ALL
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Allow admin access to user_roles"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin');

-- Create helper functions
CREATE OR REPLACE FUNCTION auth.user_has_permission(required_permission text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON rp.role_id = ur.role_id
    JOIN permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = auth.uid()
    AND p.action = required_permission
  );
END;
$$;

-- Insert base roles
INSERT INTO roles (name, description) VALUES
  ('admin', 'System administrator'),
  ('merchant', 'Merchant user'),
  ('logistician', 'Logistics operator')
ON CONFLICT (name) DO NOTHING;

-- Insert base permissions
INSERT INTO permissions (action, resource, description) VALUES
  ('products.create', 'products', 'Create products'),
  ('products.read', 'products', 'Read products'),
  ('products.update', 'products', 'Update products'),
  ('products.delete', 'products', 'Delete products'),
  ('orders.create', 'orders', 'Create orders'),
  ('orders.read', 'orders', 'Read orders'),
  ('orders.update', 'orders', 'Update orders'),
  ('orders.delete', 'orders', 'Delete orders'),
  ('inventory.manage', 'inventory', 'Manage inventory'),
  ('users.manage', 'users', 'Manage users')
ON CONFLICT (action) DO NOTHING;

-- Assign permissions to roles
WITH roles_data AS (
  SELECT id, name FROM roles
),
permissions_data AS (
  SELECT id, action FROM permissions
)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles_data r
CROSS JOIN permissions_data p
WHERE 
  (r.name = 'admin') OR
  (r.name = 'merchant' AND p.action LIKE 'products%') OR
  (r.name = 'logistician' AND p.action IN ('inventory.manage', 'orders.read', 'orders.update'))
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_permissions_action ON permissions(action);