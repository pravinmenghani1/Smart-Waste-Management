import { useState } from 'react';
import { Bell, Mail, Smartphone, Clock, MapPin, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

export function SettingsPanel() {
  const [settings, setSettings] = useState({
    notifications: {
      binFull: true,
      gasAlert: true,
      fireAlert: true,
      collectionReminder: true,
      email: true,
      sms: false,
    },
    schedule: {
      wetWaste: 'Mon, Wed, Fri',
      dryWaste: 'Tue, Sat',
      hazardous: '1st Sunday',
    },
    thresholds: {
      fillLevel: 80,
      gasLevel: 400,
    },
    contact: {
      email: 'user@example.com',
      phone: '+1234567890',
    },
  });

  const handleSave = () => {
    console.log('Saving settings:', settings);
    // TODO: Save to backend
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Notifications */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Notifications</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Bin Full Alert</p>
              <p className="text-sm text-muted-foreground">Get notified when bins reach threshold</p>
            </div>
            <Switch
              checked={settings.notifications.binFull}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, notifications: { ...settings.notifications, binFull: checked } })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Gas Level Alert</p>
              <p className="text-sm text-muted-foreground">Alert for high methane levels</p>
            </div>
            <Switch
              checked={settings.notifications.gasAlert}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, notifications: { ...settings.notifications, gasAlert: checked } })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Fire Detection Alert</p>
              <p className="text-sm text-muted-foreground">Critical fire safety alerts</p>
            </div>
            <Switch
              checked={settings.notifications.fireAlert}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, notifications: { ...settings.notifications, fireAlert: checked } })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Collection Reminders</p>
              <p className="text-sm text-muted-foreground">Remind before scheduled collection</p>
            </div>
            <Switch
              checked={settings.notifications.collectionReminder}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, notifications: { ...settings.notifications, collectionReminder: checked } })
              }
            />
          </div>
        </div>
      </div>

      {/* Notification Channels */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Notification Channels</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <p className="font-medium">Email Notifications</p>
            </div>
            <Switch
              checked={settings.notifications.email}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, notifications: { ...settings.notifications, email: checked } })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-muted-foreground" />
              <p className="font-medium">SMS Notifications</p>
            </div>
            <Switch
              checked={settings.notifications.sms}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, notifications: { ...settings.notifications, sms: checked } })
              }
            />
          </div>
        </div>
      </div>

      {/* Collection Schedule */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Collection Schedule</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-primary" />
              <span className="font-medium">Wet Waste</span>
            </div>
            <span className="text-sm text-muted-foreground">{settings.schedule.wetWaste}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-accent" />
              <span className="font-medium">Dry Waste</span>
            </div>
            <span className="text-sm text-muted-foreground">{settings.schedule.dryWaste}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-warning" />
              <span className="font-medium">Hazardous Waste</span>
            </div>
            <span className="text-sm text-muted-foreground">{settings.schedule.hazardous}</span>
          </div>
        </div>
      </div>

      {/* Alert Thresholds */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Alert Thresholds</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Fill Level Alert (%)</label>
            <Input
              type="number"
              value={settings.thresholds.fillLevel}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  thresholds: { ...settings.thresholds, fillLevel: parseInt(e.target.value) },
                })
              }
              min="0"
              max="100"
              className="bg-muted border-0"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Gas Level Alert (ppm)</label>
            <Input
              type="number"
              value={settings.thresholds.gasLevel}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  thresholds: { ...settings.thresholds, gasLevel: parseInt(e.target.value) },
                })
              }
              min="0"
              className="bg-muted border-0"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Contact Information</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Email</label>
            <Input
              type="email"
              value={settings.contact.email}
              onChange={(e) =>
                setSettings({ ...settings, contact: { ...settings.contact, email: e.target.value } })
              }
              className="bg-muted border-0"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Phone</label>
            <Input
              type="tel"
              value={settings.contact.phone}
              onChange={(e) =>
                setSettings({ ...settings, contact: { ...settings.contact, phone: e.target.value } })
              }
              className="bg-muted border-0"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
