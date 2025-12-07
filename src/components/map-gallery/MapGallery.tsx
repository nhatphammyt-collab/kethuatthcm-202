"use client"

import React, { useState, useEffect, useRef } from "react"
import { MapPin, X, ImageIcon, Info, ZoomIn, ZoomOut, Maximize2 } from "lucide-react"

const LOCATIONS = [
  {
    id: 1,
    name: "Khu Hành Chính",
    top: 13,
    left: 45,
    description: "Cập Nhật Sau",
    gallery: [
      { title: "Cập Nhật Sau", note: "Cập Nhật Sau" },
    ],
  },
  {
    id: 2,
    name: "Nhà Hàng Bến Dược",
    top: 22,
    left: 30,
    description: "Cập Nhật Sau",
    gallery: [
      { title: "Cập Nhật Sau", note: "Cập Nhật Sau" },
    ],
  },
  {
    id: 3,
    name: "Đền Bến Dược",
    top: 35,
    left: 35,
    description: "Đền tưởng niệm các anh hùng liệt sĩ.",
    gallery: [
      { title: "Đền Bến Dược", note: "Đền Bến Dược", image: "/denbenduoc/denbenduoc1.png" },
      { title: "Đền Bến Dược", note: "Đền Bến Dược", image: "/denbenduoc/denbenduoc2.png" },
      { title: "Đền Bến Dược", note: "Đền Bến Dược", image: "/denbenduoc/denbenduoc3.png" },
    ],
  },
  {
    id: 4,
    name: "Quầy Lưu Niệm",
    top: 32,
    left: 62,
    description: "Nơi bán quà lưu niệm.",
    gallery: [
      { title: "Quầy lưu niệm", note: "Quầy Lưu Niệm", image: "/quayluuniem/quayluuniem2.png" },
      { title: "Quầy lưu niệm", note: "Quầy Lưu Niệm", image: "/quayluuniem/Quayluuniem3.png" },
      { title: "Quầy lưu niệm", note: "Quầy Lưu Niệm", image: "/quayluuniem/quayluuniem4.png" },
      { title: "Quầy lưu niệm", note: "Quầy Lưu Niệm", image: "/quayluuniem/quayluuniem5.png" },
    ],
  },
  {
    id: 5,
    name: "Khu Tham Quan Địa Đạo",
    top: 48,
    left: 70,
    description: "Đường hầm bí mật của quân giải phóng.",
    gallery: [
      { title: "Hình Bác", note: "Khu Tham Quan Địa Đạo", image: "/khuthamquandiadao/1.jpg" },
      { title: "Khu họp", note: "Khu Tham Quan Địa Đạo", image: "/khuthamquandiadao/2.jpg" },
      { title: "Khu nhà dân", note: "Khu Tham Quan Địa Đạo", image: "/khuthamquandiadao/3.jpg" },
      { title: "Khu sản xuất vũ khí", note: "Khu Tham Quan Địa Đạo", image: "/khuthamquandiadao/4.jpg" },
    ],
  },
  {
    id: 6,
    name: "Khu Nghỉ Dưỡng",
    top: 52,
    left: 28,
    description: "Khu vực giải nhiệt, thư giãn.",
    gallery: [
      { title: "Hồ Bơi Khu Nghỉ Dưỡng", note: "Khu Nghỉ Dưỡng", image: "/khunghiduong/hoboi1.png" },
      { title: "Hồ Bơi Khu Nghỉ Dưỡng", note: "Khu Nghỉ Dưỡng", image: "/khunghiduong/hoboi2.png" },
      { title: "Hồ Bơi Khu Nghỉ Dưỡng", note: "Khu Nghỉ Dưỡng", image: "/khunghiduong/hoboi3.png" },
    ],
  },
  {
    id: 7,
    name: "Khu Tái Hiện Vùng Giải Phóng",
    top: 62,
    left: 45,
    description: "Tái hiện cuộc sống thời chiến tranh.",
    gallery: [
      { title: "Tái Hiện Sa Bàn", note: "Khu Tái Hiện Vùng Giải Phóng", image: "/taihien/Saban1.png" },
      { title: "Tái Hiện Sa Bàn", note: "Khu Tái Hiện Vùng Giải Phóng", image: "/taihien/Saban2.png" },
      { title: "Mô phỏng chiến trường", note: "Khu Tái Hiện Vùng Giải Phóng", image: "/taihien/Mophong.png" },
      { title: "Mô phỏng chiến trường", note: "Khu Tái Hiện Vùng Giải Phóng", image: "/taihien/Mophong1.jpg" },
      { title: "Mô phỏng chiến trường", note: "Khu Tái Hiện Vùng Giải Phóng", image: "/taihien/Mophong2.PNG" },
      { title: "Mô phỏng chiến trường", note: "Khu Tái Hiện Vùng Giải Phóng", image: "/taihien/Mophong3.PNG" },
    ],
  },
  {
    id: 8,
    name: "Hồ Mô Phỏng Biển Đông",
    top: 78,
    left: 32,
    description: "Hồ nước lớn mô phỏng quần đảo.",
    gallery: [
      { title: "Biển Đảo mô phỏng", note: "Hồ Mô Phỏng Biển Đông", image: "/biendong/biendong1.png" },
      { title: "Biển Đảo mô phỏng", note: "Hồ Mô Phỏng Biển Đông", image: "/biendong/biendong2.png" },
      { title: "Biển Đảo mô phỏng", note: "Hồ Mô Phỏng Biển Đông", image: "/biendong/biendong3.png" },
      { title: "Biển Đảo mô phỏng", note: "Hồ Mô Phỏng Biển Đông", image: "/biendong/biendong4.png" },
    ],
  },
  {
    id: 9,
    name: "Khu Bắn Súng",
    top: 88,
    left: 25,
    description: "Trải nghiệm bắn súng thật.",
    gallery: [
      { title: "Dịch vụ thuê đạn bắn súng thật", note: "Khu Bắn Súng", image: "/khubansung/bansung2.png" },
    ],
  },
  {
    id: 10,
    name: "Khu Truyền Thống Sài Gòn",
    top: 76,
    left: 70,
    description: "Khu truyền thống kiến trúc Nam Bộ.",
    gallery: [
      { title: "Khu truyền thống", note: "Khu Truyền Thống Sài Gòn", image: "/khutruyenthong/truyenthongsaigon1.png" },
      { title: "Khu truyền thống", note: "Khu Truyền Thống Sài Gòn", image: "/khutruyenthong/truyenthongsaigon2.png" },
    ],
  },
  {
    id: 11,
    name: "Đại Học FPT",
    top: 85,
    left: 5,
    description: "Trường Đại Học FPT - Nơi đào tạo nguồn nhân lực chất lượng cao.",
    gallery: [
      { title: "Trường Đại Học FPT HCM", note: "Đại Học FPT", image: "/khuonvien/fpt.jpeg" },
      { title: "Tượng Bác Hồ cao nhất miền Nam", note: "Đại Học FPT", image: "/khuonvien/TuongbacHo.png" },
      { title: "Anh Tony Bui", note: "Đại Học FPT", image: "/khuonvien/TonyBui.png" },
      { title: "Nhadam và những người bạn", note: "Đại Học FPT", image: "/khuonvien/quannhan.png" },
    ],
  },
]

type Location = (typeof LOCATIONS)[number]

// Audio mapping for each location
const LOCATION_AUDIO_MAP: Record<number, string> = {
  1: '/Voice/khuhanhchinh.mp3',
  2: '/Voice/nhahangbenduoc.mp3',
  3: '/Voice/denbenduoc.mp3',
  4: '/Voice/quayluuniem.mp3',
  5: '/Voice/khuthamquandiadao.mp3',
  6: '/Voice/khunghiduong.mp3',
  7: '/Voice/khutaihienvunggiaiphong.mp3',
  8: '/Voice/homophongbiendong.mp3',
  9: '/Voice/khubansung.mp3',
  10: '/Voice/khutruyenthongsaigon.mp3',
  // 11: Đại Học FPT - no audio
}

interface MapGalleryProps {
  tourId?: string
  currentLocationId?: number | null
  isDriver?: boolean
  onLocationChange?: (locationId: number) => void
  // For livestream-style interactions
  reactionsComponent?: React.ReactNode
  chatComponent?: React.ReactNode
}

export function MapGallery({
  tourId,
  currentLocationId,
  isDriver = false,
  onLocationChange,
  reactionsComponent,
  chatComponent,
}: MapGalleryProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [hoveredLocation, setHoveredLocation] = useState<Location | null>(null)
  const [guidePosition, setGuidePosition] = useState({ top: 85, left: 5 })
  const [isGuideMoving, setIsGuideMoving] = useState(false)
  const [zoomedImage, setZoomedImage] = useState<{url: string, title: string} | null>(null)
  const [imageZoom, setImageZoom] = useState(1)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showPassengerAlert, setShowPassengerAlert] = useState(false)

  // Sync with tour location - Auto open modal when location changes (ONLY in tour mode)
  // In test mode (no tourId), this effect should NOT run to avoid Firebase calls
  useEffect(() => {
    // Only sync if we have tourId (production mode)
    if (tourId && currentLocationId !== undefined && currentLocationId !== null) {
      const location = LOCATIONS.find((l) => l.id === currentLocationId)
      if (location) {
        // Move guide to location
        setIsGuideMoving(true)
        setGuidePosition({ top: location.top, left: location.left + 6 })
        
        // Wait for animation then open modal
        setTimeout(() => {
          setSelectedLocation(location)
          setIsGuideMoving(false)
        }, 1500)
      }
    }
    // If no tourId (test mode), don't do anything - let handleMarkerClick handle it
  }, [tourId, currentLocationId])

  const handleMarkerClick = (location: Location) => {
    // In tour mode, only driver can move
    if (tourId && !isDriver) {
      // Passengers cannot move - show alert
      setShowPassengerAlert(true)
      // Auto hide alert after 3 seconds
      setTimeout(() => {
        setShowPassengerAlert(false)
      }, 3000)
      return
    }

    // Don't move if clicking on the starting location (Đại Học FPT)
    if (location.id === 11) {
      setSelectedLocation(location)
      // Still notify parent for test mode
      if (onLocationChange) {
        onLocationChange(location.id)
      }
      return
    }
    
    // If in tour mode and driver, notify parent
    if (tourId && isDriver && onLocationChange) {
      onLocationChange(location.id)
      return
    }
    
    // Test mode or standalone mode - notify parent if callback exists
    if (onLocationChange) {
      onLocationChange(location.id)
    }
    
    setIsGuideMoving(true)
    setGuidePosition({ top: location.top, left: location.left + 6 })

    // Wait for animation to complete before opening modal
    setTimeout(() => {
      setSelectedLocation(location)
      setIsGuideMoving(false)
    }, 1500)
  }

  // Cleanup audio when location changes or component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        audioRef.current = null
      }
      setIsPlaying(false)
    }
  }, [selectedLocation?.id])

  const handleCloseModal = () => {
    // Stop audio if playing
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    setIsPlaying(false)
    setSelectedLocation(null)
    // Don't reset guide position - character stays at the location
  }

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!selectedLocation) return
    
    const audioUrl = LOCATION_AUDIO_MAP[selectedLocation.id]
    if (!audioUrl) return

    // Stop previous audio if playing
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    const audio = new Audio(audioUrl)
    audio.play().catch(console.error)
    setIsPlaying(true)
    
    audio.onended = () => {
      setIsPlaying(false)
      audioRef.current = null
    }
    
    audio.onpause = () => {
      setIsPlaying(false)
    }

    audio.onerror = () => {
      setIsPlaying(false)
      audioRef.current = null
    }

    audioRef.current = audio
  }

  const handleImageClick = (imageUrl: string, title: string) => {
    setZoomedImage({ url: imageUrl, title })
    setImageZoom(1)
  }

  const handleCloseZoom = () => {
    setZoomedImage(null)
    setImageZoom(1)
  }

  const handleZoomIn = () => {
    setImageZoom(prev => Math.min(prev + 0.5, 3))
  }

  const handleZoomOut = () => {
    setImageZoom(prev => Math.max(prev - 0.5, 0.5))
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#c41e3a] mb-2">KHU DI TÍCH LỊCH SỬ ĐỊA ĐẠO CỦ CHI</h1>
        <p className="text-lg text-[#FFD700] font-semibold bg-[#c41e3a] inline-block px-4 py-1 rounded">
          Sơ Đồ Các Điểm Tham Quan Khu Bến Dược
        </p>
      </div>

      {/* Map Container */}
      <div className="relative w-full aspect-square md:aspect-video">
        {/* Map Background */}
        <img src="/map.jpg" alt="Bản đồ Địa Đạo Củ Chi" className="w-full h-full object-contain bg-white" />

        {/* Map Markers */}
        {LOCATIONS.map((location) => (
          <div
            key={location.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
            style={{ top: `${location.top}%`, left: `${location.left}%` }}
            onClick={() => handleMarkerClick(location)}
            onMouseEnter={() => setHoveredLocation(location)}
            onMouseLeave={() => setHoveredLocation(null)}
          >
            {/* Pulse Animation */}
            <span className="absolute inline-flex h-8 w-8 rounded-full bg-[#c41e3a] opacity-75 animate-ping" />

            {/* Marker Icon */}
            <div className="relative z-10 bg-[#c41e3a] rounded-full p-1.5 shadow-lg border-2 border-[#FFD700] hover:scale-125 transition-transform">
              <MapPin className="h-4 w-4 text-[#FFD700]" />
            </div>

            {/* Tooltip */}
            {hoveredLocation?.id === location.id && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#c41e3a] text-white text-sm font-medium rounded-lg shadow-lg whitespace-nowrap z-20 border border-[#FFD700]">
                {location.name}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#c41e3a]" />
              </div>
            )}
          </div>
        ))}

        <div
          className={`absolute z-30 w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-[#FFD700] shadow-2xl transition-all duration-[1500ms] ease-in-out transform -translate-x-1/2 -translate-y-1/2 overflow-hidden ${
            isGuideMoving ? "animate-bounce" : ""
          }`}
          style={{
            top: `${guidePosition.top}%`,
            left: `${guidePosition.left}%`,
            backgroundImage: `url('/chibi-guerrilla.png')`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundColor: "white",
          }}
        >
          {/* Speech bubble when at a location */}
          {selectedLocation && guidePosition.left !== 5 && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-white text-[#c41e3a] text-xs font-bold rounded-lg shadow-lg whitespace-nowrap border-2 border-[#FFD700]">
              Đây rồi!
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
        <Info className="h-4 w-4" />
        <span>Nhấn vào các điểm đánh dấu để xem thư viện hình ảnh - Chú bộ đội sẽ dẫn đường cho bạn!</span>
      </div>

      {/* Passenger Alert - Only show in tour mode for passengers */}
      {showPassengerAlert && tourId && !isDriver && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] bg-[#c41e3a] text-white px-6 py-4 rounded-lg shadow-2xl border-4 border-[#FFD700] animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🚫</div>
            <div>
              <p className="font-bold text-lg">Chỉ Tài Xế mới có thể di chuyển!</p>
              <p className="text-sm opacity-90 mt-1">Vui lòng chờ Tài Xế di chuyển đến địa điểm.</p>
            </div>
            <button
              onClick={() => setShowPassengerAlert(false)}
              className="ml-4 p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {selectedLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={handleCloseModal}>
          <div
            className="relative w-full max-w-2xl bg-gradient-to-b from-[#c41e3a] to-[#8b1428] rounded-2xl shadow-2xl overflow-hidden border-4 border-[#FFD700]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative p-6 text-center border-b-2 border-[#FFD700]">
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 p-1 rounded-full bg-[#FFD700] text-[#c41e3a] hover:bg-yellow-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-2xl font-bold text-[#FFD700] mb-2">{selectedLocation.name}</h2>
              <p className="text-white/90 text-sm">{selectedLocation.description}</p>
            </div>

            {/* Gallery Grid */}
            <div className="p-6 relative">
              {/* HDV Character - Top Left of Gallery */}
              {LOCATION_AUDIO_MAP[selectedLocation.id] && (
                <div className="absolute top-2 left-2 z-20 pointer-events-auto">
                  <button
                    onClick={handlePlayAudio}
                    className="relative group"
                    disabled={isPlaying}
                    title="Nhấn để nghe hướng dẫn"
                  >
                    <img
                      src="/hdv.png"
                      alt="Hướng Dẫn Viên"
                      className={`w-16 h-16 md:w-20 md:h-20 object-contain transition-all ${
                        isPlaying 
                          ? 'animate-pulse scale-110' 
                          : 'hover:scale-105'
                      }`}
                      style={{ 
                        filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5))',
                        animation: isPlaying ? 'none' : 'characterFloat 3s ease-in-out infinite'
                      }}
                    />
                    {/* Play icon overlay */}
                    {!isPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    )}
                    {/* Playing indicator */}
                    {isPlaying && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#FFD700] rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-[#c41e3a] rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </button>
                </div>
              )}
              
              <h3 className="text-[#FFD700] font-semibold mb-4 text-center">THƯ VIỆN KỶ NIỆM</h3>
              <div className="max-h-[600px] overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-4">
                  {selectedLocation.gallery.map((item, index) => (
                    <div
                      key={index}
                      className="bg-yellow-50 rounded-xl border-2 border-[#FFD700] overflow-hidden shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
                      onClick={() => 'image' in item && item.image && handleImageClick(item.image, item.title)}
                    >
                      {/* Image */}
                      <div className="aspect-video bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center overflow-hidden relative group">
                        {'image' in item && item.image ? (
                          <>
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-contain p-4"
                            />
                            {/* Zoom hint overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                              <Maximize2 className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </>
                        ) : (
                          <ImageIcon className="h-12 w-12 text-[#c41e3a] opacity-50" />
                        )}
                      </div>

                      {/* Caption */}
                      <div className="p-3 bg-white border-t-2 border-[#FFD700]">
                        <h4 className="font-bold text-[#c41e3a] text-sm">{item.title}</h4>
                        <p className="text-gray-600 text-xs mt-1">{item.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#8b1428] border-t-2 border-[#FFD700] text-center">
              <p className="text-yellow-200 text-xs">Địa Đạo Củ Chi - Di Tích Lịch Sử Quốc Gia</p>
            </div>
          </div>
        </div>
      )}

      {/* Zoomed Image Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90"
          onClick={handleCloseZoom}
        >
          <div
            className="relative w-full h-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseZoom}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[#FFD700] text-[#c41e3a] hover:bg-yellow-300 transition-colors shadow-lg"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Zoom Controls */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              <button
                onClick={handleZoomIn}
                disabled={imageZoom >= 3}
                className="p-2 rounded-full bg-[#FFD700] text-[#c41e3a] hover:bg-yellow-300 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                title="Phóng to"
              >
                <ZoomIn className="h-6 w-6" />
              </button>
              <button
                onClick={handleZoomOut}
                disabled={imageZoom <= 0.5}
                className="p-2 rounded-full bg-[#FFD700] text-[#c41e3a] hover:bg-yellow-300 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                title="Thu nhỏ"
              >
                <ZoomOut className="h-6 w-6" />
              </button>
              <div className="px-3 py-1 rounded-full bg-[#FFD700] text-[#c41e3a] text-sm font-bold text-center shadow-lg">
                {Math.round(imageZoom * 100)}%
              </div>
            </div>

            {/* Image Title */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-[#FFD700] text-[#c41e3a] rounded-full font-bold shadow-lg">
              {zoomedImage.title}
            </div>

            {/* Zoomable Image Container */}
            <div className="w-full h-full flex items-center justify-center overflow-auto p-20">
              <img
                src={zoomedImage.url}
                alt={zoomedImage.title}
                className="max-w-none transition-transform duration-200 cursor-move"
                style={{
                  transform: `scale(${imageZoom})`,
                  transformOrigin: 'center center'
                }}
                draggable={false}
              />
            </div>

            {/* Livestream-style Interactions Overlay */}
            {(reactionsComponent || chatComponent) && (
              <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-4 p-4 pointer-events-none">
                {/* Reactions - Top right */}
                {reactionsComponent && (
                  <div className="self-end pointer-events-auto max-w-sm">
                    {reactionsComponent}
                  </div>
                )}
                
                {/* Chat - Bottom right */}
                {chatComponent && (
                  <div className="self-end pointer-events-auto max-w-sm w-full">
                    {chatComponent}
                  </div>
                )}
              </div>
            )}

            {/* Instructions */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/70 text-white text-sm rounded-lg">
              Nhấn ngoài ảnh hoặc nút X để đóng
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

