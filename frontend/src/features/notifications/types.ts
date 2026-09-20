export type TipNotificare = 'confirmare' | 'cerere_compatibila' | 'raspuns_suport'

export type NotificationLink = '/cererile-mele' | '/cereri-compatibile' | '/suport'

export type Notificare = {
    id: string
    userId: string
    tip: TipNotificare
    titlu: string
    mesaj: string
    citita: boolean
    data: string
    link?: NotificationLink
}
