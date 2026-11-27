/**
 * Notifications and KeepAwake Service
 * Encapsulates @capacitor/local-notifications, @capacitor/haptics, and @capacitor-community/keep-awake.
 */

import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { KeepAwake } from '@capacitor-community/keep-awake';

class NotificationService {
  constructor() {
    this.isChannelCreated = false;
  }

  async initialize() {
    try {
      // Create Android Notification Channel
      await LocalNotifications.createChannel({
        id: 'bioadapt_alerts',
        name: 'BioAdapt Stress Alerts',
        description: 'ISEF BioAdapt stress and sensor status alerts',
        importance: 4, // High importance
        visibility: 1, // Public
        sound: 'beep.wav',
        vibration: true,
      });
      this.isChannelCreated = true;
    } catch (e) {
      console.warn('[NotificationService] Channel creation warning (normal in web):', e);
    }
  }

  async requestPermissions() {
    try {
      const status = await LocalNotifications.requestPermissions();
      return status.display === 'granted';
    } catch (e) {
      console.warn('[NotificationService] Permission request warning:', e);
      return false;
    }
  }

  async triggerVibration(type = 'warning') {
    try {
      if (type === 'critical') {
        await Haptics.notification({ type: NotificationType.Error });
      } else if (type === 'warning') {
        await Haptics.notification({ type: NotificationType.Warning });
      } else {
        await Haptics.impact({ style: ImpactStyle.Light });
      }
    } catch (e) {
      // Haptics fail silently on web
    }
  }

  async sendNotification({ title, body, level = 'info' }) {
    try {
      await this.initialize();
      const id = Math.floor(Math.random() * 100000);
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id,
            channelId: 'bioadapt_alerts',
            schedule: { at: new Date(Date.now() + 100) },
          },
        ],
      });
    } catch (e) {
      console.warn('[NotificationService] LocalNotification error (normal in browser):', e);
    }
  }

  async setKeepScreenOn(enable) {
    try {
      if (enable) {
        await KeepAwake.keepAwake();
      } else {
        await KeepAwake.allowSleep();
      }
    } catch (e) {
      console.warn('[NotificationService] KeepAwake warning (normal in web):', e);
    }
  }
}

export const notificationService = new NotificationService();
