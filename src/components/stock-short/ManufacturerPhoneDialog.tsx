import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageCircle, Save } from 'lucide-react';
import { useManufacturers } from '@/hooks/useManufacturers';

interface ManufacturerPhoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manufacturerName: string;
  existingPhone?: string;
  onShare: (phone: string) => void;
}

export function ManufacturerPhoneDialog({
  open,
  onOpenChange,
  manufacturerName,
  existingPhone,
  onShare,
}: ManufacturerPhoneDialogProps) {
  const { manufacturers, createManufacturer, updateManufacturer } = useManufacturers();
  const [phone, setPhone] = useState(existingPhone || '');
  const [saveForFuture, setSaveForFuture] = useState(true);

  const existingManufacturer = manufacturers.find(
    (m) => m.name.toLowerCase() === manufacturerName.toLowerCase()
  );

  useEffect(() => {
    if (existingManufacturer?.phone) {
      setPhone(existingManufacturer.phone);
    } else if (existingPhone) {
      setPhone(existingPhone);
    }
  }, [existingManufacturer, existingPhone]);

  const handleShare = async () => {
    if (!phone.trim()) return;

    // Save manufacturer phone for future use
    if (saveForFuture) {
      if (existingManufacturer) {
        if (existingManufacturer.phone !== phone) {
          await updateManufacturer.mutateAsync({
            id: existingManufacturer.id,
            name: existingManufacturer.name,
            phone,
          });
        }
      } else {
        await createManufacturer.mutateAsync({
          name: manufacturerName,
          phone,
        });
      }
    }

    onShare(phone);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share via WhatsApp</DialogTitle>
          <DialogDescription>
            Enter the phone number for {manufacturerName} to send the order directly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (with country code)</Label>
            <Input
              id="phone"
              placeholder="+8801XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Example: +8801712345678 for Bangladesh
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="saveForFuture"
              checked={saveForFuture}
              onChange={(e) => setSaveForFuture(e.target.checked)}
              className="rounded border-input"
            />
            <Label htmlFor="saveForFuture" className="text-sm font-normal cursor-pointer">
              Save this number for {manufacturerName}
            </Label>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleShare} disabled={!phone.trim()}>
            <MessageCircle className="h-4 w-4 mr-2" />
            Send via WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
