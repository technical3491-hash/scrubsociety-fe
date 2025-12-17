import DashboardWidget from '../DashboardWidget';
import { Activity } from 'lucide-react';

export default function DashboardWidgetExample() {
  return (
    <div className="p-4 max-w-sm">
      <DashboardWidget
        title="Today's Cases"
        icon={Activity}
        metric="12"
        description="New cases posted in your network"
        actionLabel="View All Cases"
        onAction={() => console.log('View all cases clicked')}
      />
    </div>
  );
}
