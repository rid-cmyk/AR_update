'use client'

import { useState, useEffect } from 'react'
import { message } from 'antd'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  X,
  Clock,
  Users,
  FileText,
  Database
} from 'lucide-react'
interface Notification {
  id: string
  type: 'success' | 'warning' | 'info' | 'error'
  title: string
  message: string
  timestamp: Date
  isRead: boolean
  category: 'system' | 'user' | 'template' | 'ujian' | 'raport'
  actionUrl?: string
}

export function SystemNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      // Simulasi data notifikasi
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'success',
          title: 'Template Ujian Berhasil Dibuat',
          message: 'Template ujian MHQ untuk semester 1 telah berhasil dibuat dan siap digunakan.',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          isRead: false,
          category: 'template'
        },
        {
          id: '2',
          type: 'info',
          title: 'Backup Otomatis Selesai',
          message: 'Backup database harian telah selesai dilakukan pada 02:00 WIB.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          isRead: false,
          category: 'system'
        },
        {
          id: '3',
          type: 'warning',
          title: 'Storage Hampir Penuh',
          message: 'Penggunaan storage mencapai 85%. Pertimbangkan untuk membersihkan file lama.',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          isRead: true,
          category: 'system'
        },
        {
          id: '4',
          type: 'success',
          title: 'Raport Batch Generated',
          message: '25 raport santri telah berhasil di-generate untuk semester 1.',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          isRead: true,
          category: 'raport'
        },
        {
          id: '5',
          type: 'info',
          title: 'Pengguna Baru Terdaftar',
          message: '3 guru baru telah terdaftar dalam sistem hari ini.',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
          isRead: true,
          category: 'user'
        }
      ]
      
      setNotifications(mockNotifications)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setIsLoading(false)
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    )
    message.success('Semua notifikasi ditandai sebagai dibaca')
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
    message.success('Notifikasi dihapus')
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-600" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'system':
        return <Database className="w-4 h-4" />
      case 'user':
        return <Users className="w-4 h-4" />
      case 'template':
      case 'ujian':
        return <FileText className="w-4 h-4" />
      case 'raport':
        return <FileText className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'info':
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) {
      return `${minutes} menit yang lalu`
    } else if (hours < 24) {
      return `${hours} jam yang lalu`
    } else {
      return `${days} hari yang lalu`
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifikasi Sistem
            {unreadCount > 0 && (
              <Badge className="bg-red-100 text-red-800 ml-2">
                {unreadCount} baru
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Tandai Semua Dibaca
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Bell className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>Tidak ada notifikasi</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-colors ${
                  notification.isRead 
                    ? 'bg-slate-50 border-slate-200' 
                    : 'bg-white border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-medium text-sm ${
                        notification.isRead ? 'text-slate-600' : 'text-slate-800'
                      }`}>
                        {notification.title}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        <div className="flex items-center gap-1">
                          {getCategoryIcon(notification.category)}
                          {notification.category}
                        </div>
                      </Badge>
                    </div>
                    
                    <p className={`text-sm ${
                      notification.isRead ? 'text-slate-500' : 'text-slate-600'
                    }`}>
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-500">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                      <Badge className={`${getBadgeColor(notification.type)} text-xs`}>
                        {notification.type}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="h-8 w-8 p-0"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}