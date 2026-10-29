"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Calendar } from 'lucide-react';

interface AnnounceDistributionCycleFormProps {
  onSuccess?: () => void;
}

export default function AnnounceDistributionCycleForm({ onSuccess }: AnnounceDistributionCycleFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cycleStartDate: '',
    description: ''
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cycleStartDate) {
      toast({ 
        title: 'Validation Error', 
        description: 'Please select a distribution start date', 
        variant: 'destructive' 
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/distributor/announce-cycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cycleStartDate: formData.cycleStartDate,
          description: formData.description || null
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to announce distribution cycle');
      }
      
      toast({ 
        title: 'Success!', 
        description: `Distribution cycle announced successfully. Notifications sent to ${data.notificationsSent} cardholders.`
      });
      
      // Reset form
      setFormData({ cycleStartDate: '', description: '' });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      toast({ 
        title: 'Error', 
        description: err.message, 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Announce Next Distribution Cycle
        </CardTitle>
        <CardDescription>
          Announce the date for the next ration distribution. All cardholders will be notified via email and SMS.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cycleStartDate">Distribution Start Date</Label>
            <Input
              id="cycleStartDate"
              type="date"
              value={formData.cycleStartDate}
              onChange={(e) => handleChange('cycleStartDate', e.target.value)}
              disabled={loading}
              required
            />
            <p className="text-xs text-muted-foreground">
              Select the date when the distribution cycle will start
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add any additional details about the distribution cycle..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              disabled={loading}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              This will be included in the notification to cardholders
            </p>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Announcing...' : 'Announce Distribution Cycle'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
