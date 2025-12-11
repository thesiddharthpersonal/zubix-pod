import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, CheckCircle2, Mail } from 'lucide-react';

const PendingApproval = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <div className="w-24 h-24 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-12 h-12 text-warning" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Application Submitted!
          </h1>
          <p className="text-muted-foreground">
            Your pod owner application is pending admin approval. We'll notify you once it's reviewed.
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4">What happens next?</h3>
            <ul className="space-y-4 text-left">
              <li className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Application Review</p>
                  <p className="text-sm text-muted-foreground">Our team will review your application within 24-48 hours</p>
                </div>
              </li>
              <li className="flex gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Email Notification</p>
                  <p className="text-sm text-muted-foreground">You'll receive an email once your application is approved</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button variant="ghost" className="w-full" asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;
