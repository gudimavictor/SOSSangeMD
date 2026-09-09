import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { centre } from './centers'
import type { CentruTransfuzie } from './centers'
import './CentersPage.css'

function iconPentru(activ: boolean) {
    return L.divIcon({
        className: 'mapMarkerIcon',
        html: activ
            ? `<div class="mapMarkerPulse"></div><div class="mapMarkerPin mapMarkerPinActiv"></div>`
            : `<div class="mapMarkerPin"></div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 26],
        popupAnchor: [0, -26],
    })
}

const iconInactiv = iconPentru(false)
const iconActiv = iconPentru(true)

function toRad(v: number) {
    return (v * Math.PI) / 180
}

function distantaKm(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 6371
    const dLat = toRad(lat2 - lat1)
    const dLng = toRad(lng2 - lng1)
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

type MapControllerProps = {
    selectat: string | null
    pozitieUser: { lat: number; lng: number } | null
    rutaCoords: [number, number][] | null
}

function MapController({ selectat, pozitieUser, rutaCoords }: MapControllerProps) {
    const map = useMap()

    useEffect(() => {
        if (selectat) return
        const bounds = L.latLngBounds(centre.map((c) => [c.lat, c.lng]))
        map.fitBounds(bounds, { padding: [50, 50] })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (rutaCoords && rutaCoords.length > 0) {
            const bounds = L.latLngBounds(rutaCoords)
            map.fitBounds(bounds, { padding: [60, 60] })
            return
        }
        if (!selectat) return
        const c = centre.find((item) => item.id === selectat)
        if (c) map.flyTo([c.lat, c.lng], 13, { duration: 0.8 })
    }, [selectat, rutaCoords, map])

    useEffect(() => {
        if (!pozitieUser || rutaCoords) return
        map.flyTo([pozitieUser.lat, pozitieUser.lng], 11, { duration: 0.8 })
    }, [pozitieUser, rutaCoords, map])

    return null
}

export function CentersPage() {
    const [selectat, setSelectat] = useState<string | null>(null)
    const [pozitieUser, setPozitieUser] = useState<{ lat: number; lng: number } | null>(null)
    const [cautaEroare, setCautaEroare] = useState('')
    const [seCauta, setSeCauta] = useState(false)
    const [rutaCoords, setRutaCoords] = useState<[number, number][] | null>(null)
    const [rutaInfo, setRutaInfo] = useState<{ km: number; minute: number } | null>(null)
    const [rutaSeIncarca, setRutaSeIncarca] = useState(false)

    useEffect(() => {
        if (!pozitieUser || !selectat) {
            setRutaCoords(null)
            setRutaInfo(null)
            return
        }

        const centru = centre.find((c) => c.id === selectat)
        if (!centru) return

        const controller = new AbortController()
        setRutaSeIncarca(true)

        const url = `https://router.project-osrm.org/route/v1/driving/${pozitieUser.lng},${pozitieUser.lat};${centru.lng},${centru.lat}?overview=full&geometries=geojson`

        fetch(url, { signal: controller.signal })
            .then((res) => res.json())
            .then((data) => {
                if (data.code === 'Ok' && data.routes?.[0]) {
                    const ruta = data.routes[0]
                    const coords: [number, number][] = ruta.geometry.coordinates.map(
                        ([lng, lat]: [number, number]) => [lat, lng]
                    )
                    setRutaCoords(coords)
                    setRutaInfo({
                        km: ruta.distance / 1000,
                        minute: Math.round(ruta.duration / 60),
                    })
                } else {
                    setRutaCoords(null)
                    setRutaInfo(null)
                }
            })
            .catch(() => {
                setRutaCoords(null)
                setRutaInfo(null)
            })
            .finally(() => setRutaSeIncarca(false))

        return () => controller.abort()
    }, [pozitieUser, selectat])

    function gasesteCelMaiApropiat() {
        if (!navigator.geolocation) {
            setCautaEroare('Browserul tău nu suportă geolocația.')
            return
        }

        setSeCauta(true)
        setCautaEroare('')

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords
                setPozitieUser({ lat: latitude, lng: longitude })

                let mailApropiat: CentruTransfuzie = centre[0]
                let minDist = Infinity
                for (const c of centre) {
                    const d = distantaKm(latitude, longitude, c.lat, c.lng)
                    if (d < minDist) {
                        minDist = d
                        mailApropiat = c
                    }
                }
                setSelectat(mailApropiat.id)
                setSeCauta(false)
            },
            () => {
                setCautaEroare('Nu am putut obține locația ta. Verifică permisiunile browserului.')
                setSeCauta(false)
            }
        )
    }

    const centreSortate = pozitieUser
        ? [...centre].sort(
            (a, b) =>
                distantaKm(pozitieUser.lat, pozitieUser.lng, a.lat, a.lng) -
                distantaKm(pozitieUser.lat, pozitieUser.lng, b.lat, b.lng)
        )
        : centre

    return (
        <div className="centersPage">
            <div className="centersHero">
                <h1 className="centersHeroTitle">Centre de transfuzie</h1>
                <p className="centersHeroSubtitle">
                    Găsește cel mai apropiat centru unde poți dona sânge sau ridica informații.
                </p>
                <button className="centersLocateButton" onClick={gasesteCelMaiApropiat} disabled={seCauta}>
                    {seCauta ? 'Se caută...' : '📍 Centrul cel mai apropiat de mine'}
                </button>
                {cautaEroare && <p className="centersLocateError">{cautaEroare}</p>}
                {rutaSeIncarca && <p className="centersRouteInfo">Se calculează traseul...</p>}
                {rutaInfo && !rutaSeIncarca && (
                    <p className="centersRouteInfo">
                        🚗 {rutaInfo.km.toFixed(1)} km · ~{rutaInfo.minute} min cu mașina
                    </p>
                )}
            </div>

            <div className="centersBody">
                <div className="centersMapWrap">
                    <MapContainer center={[47.0159, 28.8419]} zoom={7} scrollWheelZoom className="centersMap">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <MapController selectat={selectat} pozitieUser={pozitieUser} rutaCoords={rutaCoords} />

                        {pozitieUser && (
                            <CircleMarker
                                center={[pozitieUser.lat, pozitieUser.lng]}
                                radius={8}
                                pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.9, weight: 3 }}
                            >
                                <Popup>Locația ta</Popup>
                            </CircleMarker>
                        )}

                        {rutaCoords && (
                            <Polyline
                                positions={rutaCoords}
                                pathOptions={{ color: '#2563eb', weight: 5, opacity: 0.75 }}
                            />
                        )}

                        {centre.map((c) => (
                            <Marker
                                key={c.id}
                                position={[c.lat, c.lng]}
                                icon={c.id === selectat ? iconActiv : iconInactiv}
                                eventHandlers={{ click: () => setSelectat(c.id) }}
                            >
                                <Popup>
                                    <div className="mapPopup">
                                        <span className="mapPopupCity">{c.oras}</span>
                                        <strong className="mapPopupName">{c.nume}</strong>
                                        <span className="mapPopupAddress">{c.adresa}</span>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

                <div className="centersList">
                    {centreSortate.map((c) => {
                        const dist = pozitieUser
                            ? distantaKm(pozitieUser.lat, pozitieUser.lng, c.lat, c.lng)
                            : null

                        return (
                            <button
                                key={c.id}
                                className={`centerCard ${selectat === c.id ? 'centerCardActive' : ''}`}
                                onClick={() => setSelectat(c.id)}
                            >
                                <div className="centerCardTop">
                                    <span className="centerCardCity">{c.oras}</span>
                                    {dist !== null && <span className="centerCardDistance">{dist.toFixed(1)} km</span>}
                                </div>
                                <p className="centerCardName">{c.nume}</p>
                                <p className="centerCardAddress">📍 {c.adresa}</p>
                                <p className="centerCardDetail">📞 {c.telefon}</p>
                                <p className="centerCardDetail">🕒 {c.program}</p>
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}