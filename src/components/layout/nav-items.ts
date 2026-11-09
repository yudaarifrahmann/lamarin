import {
  LayoutDashboard,
  Send,
  FolderArchive,
  Settings2,
  History,
} from 'lucide-react'
import type { NavItem } from '@/types/navigation'

export const NAV_ITEMS: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    description: 'Ringkasan aktivitas dan status lamaran',
  },
  {
    title: 'Kirim Lamaran',
    href: '/kirim-lamaran',
    icon: Send,
    description: 'Kirim email lamaran baru secara otomatis',
  },
  {
    title: 'Manajemen Dokumen',
    href: '/manajemen-dokumen',
    icon: FolderArchive,
    description: 'Kelola CV, portofolio, dan sertifikat',
  },
  {
    title: 'Konfigurasi Email',
    href: '/konfigurasi-email',
    icon: Settings2,
    description: 'Pengaturan nama pengirim, template, dan API',
  },
  {
    title: 'Riwayat Lamaran',
    href: '/riwayat-lamaran',
    icon: History,
    description: 'Log dan status pelacakan lamaran terkirim',
  },
]

