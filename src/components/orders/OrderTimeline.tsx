import React from 'react';
import { Circle, CheckCircle } from 'lucide-react';

interface TimelineEvent {
  id: string;
  type: 'status_change' | 'note' | 'refund' | 'return';
  date: string;
  description: string;
  user?: string;
}

interface OrderTimelineProps {
  events: TimelineEvent[];
}

const OrderTimeline: React.FC<OrderTimelineProps> = ({ events }) => {
  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {events.map((event, eventIdx) => (
          <li key={event.id}>
            <div className="relative pb-8">
              {eventIdx !== events.length - 1 ? (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white">
                    {event.type === 'status_change' ? (
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400" />
                    )}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-500">{event.description}</p>
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    <time dateTime={event.date}>
                      {new Date(event.date).toLocaleString()}
                    </time>
                    {event.user && (
                      <p className="text-xs text-gray-400">by {event.user}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderTimeline;