/**
 * Browser Notifications Utility
 * Handles requesting permissions and sending notifications
 */

class NotificationManager {
  private permission: NotificationPermission = 'default'

  constructor() {
    // Check current permission status
    if ('Notification' in window) {
      this.permission = Notification.permission
    }
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return false
    }

    if (this.permission === 'granted') {
      return true
    }

    if (this.permission === 'denied') {
      console.warn('Notifications permission was denied')
      return false
    }

    const result = await Notification.requestPermission()
    this.permission = result
    
    return result === 'granted'
  }

  /**
   * Check if notifications are supported and permitted
   */
  isEnabled(): boolean {
    return 'Notification' in window && this.permission === 'granted'
  }

  /**
   * Send a notification
   */
  send(title: string, options?: NotificationOptions): Notification | null {
    if (!this.isEnabled()) {
      console.warn('Notifications not enabled')
      return null
    }

    const defaultOptions: NotificationOptions = {
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: 'wakalat-notification',
      requireInteraction: false,
      ...options
    }

    const notification = new Notification(title, defaultOptions)

    // Auto close after 5 seconds unless requireInteraction is true
    if (!defaultOptions.requireInteraction) {
      setTimeout(() => {
        notification.close()
      }, 5000)
    }

    return notification
  }

  /**
   * Send notification for new chat message
   */
  notifyNewMessage(fromAgent: string, message: string): Notification | null {
    return this.send(`رسالة جديدة من ${fromAgent}`, {
      body: message.length > 50 ? message.substring(0, 50) + '...' : message,
      tag: 'chat-message',
      icon: '/favicon.ico',
      data: { type: 'chat', agent: fromAgent }
    })
  }

  /**
   * Send notification for connection request
   */
  notifyConnectionRequest(fromAgent: string): Notification | null {
    return this.send(`طلب تواصل جديد`, {
      body: `${fromAgent} يريد التواصل معك`,
      tag: 'connection-request',
      icon: '/favicon.ico',
      requireInteraction: true,
      data: { type: 'connection', agent: fromAgent }
    })
  }

  /**
   * Send notification for new follower
   */
  notifyNewFollower(agent: string): Notification | null {
    return this.send(`متابع جديد!`, {
      body: `${agent} يتابعك الآن`,
      tag: 'new-follower',
      icon: '/favicon.ico',
      data: { type: 'follow', agent }
    })
  }

  /**
   * Send welcome notification
   */
  notifyWelcome(): Notification | null {
    return this.send('مرحباً بك في وكالات! 👋', {
      body: 'ستصلك إشعارات الرسائل والتواصل هنا',
      tag: 'welcome',
      icon: '/favicon.ico'
    })
  }
}

// Export singleton
export const notifications = new NotificationManager()

// React hook for notifications
export function useNotifications() {
  return {
    requestPermission: () => notifications.requestPermission(),
    isEnabled: () => notifications.isEnabled(),
    send: (title: string, options?: NotificationOptions) => notifications.send(title, options),
    notifyNewMessage: (from: string, msg: string) => notifications.notifyNewMessage(from, msg),
    notifyConnectionRequest: (from: string) => notifications.notifyConnectionRequest(from),
    notifyNewFollower: (agent: string) => notifications.notifyNewFollower(agent),
    notifyWelcome: () => notifications.notifyWelcome()
  }
}
