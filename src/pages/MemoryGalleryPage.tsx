import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { RoleSelection } from "../components/tour/RoleSelection"

export default function MemoryGalleryPage() {
  const navigate = useNavigate()

  // Redirect to role selection
  useEffect(() => {
    // Check if user is already in a tour
    const tourId = sessionStorage.getItem("currentTourId")
    const role = sessionStorage.getItem("currentTourRole")
    
    if (tourId && role) {
      // Check if tour exists and redirect accordingly
      navigate(`/memory-gallery/tour/${tourId}`, { replace: true })
    }
  }, [navigate])

  return <RoleSelection />
}
