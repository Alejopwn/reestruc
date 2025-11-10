import { useEffect, useRef } from 'react'

export default function ParticlesBackground({ 
  particleCount = 100,
  colors = ['rgba(231, 76, 60,', 'rgba(243, 156, 18,', 'rgba(241, 196, 15,'],
  speed = 'medium' // 'slow', 'medium', 'fast'
}) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animationFrameId
    let particles = []

    // Configurar tamaño del canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Velocidades según configuración
    const speedMultiplier = {
      slow: 0.5,
      medium: 1,
      fast: 1.5
    }[speed] || 1

    // Clase Partícula
    class Particle {
      constructor() {
        this.reset()
        this.y = Math.random() * canvas.height
        this.opacity = Math.random() * 0.5 + 0.3
      }

      reset() {
        this.x = Math.random() * canvas.width
        this.y = canvas.height + Math.random() * 100
        this.size = Math.random() * 3 + 1
        this.speedX = (Math.random() * 0.5 - 0.25) * speedMultiplier
        this.speedY = (Math.random() * -1 - 0.5) * speedMultiplier
        this.color = colors[Math.floor(Math.random() * colors.length)]
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY
        
        // Resetear si sale de la pantalla
        if (this.y < -10) {
          this.reset()
        }
        if (this.x < -10 || this.x > canvas.width + 10) {
          this.x = Math.random() * canvas.width
        }

        // Efecto de parpadeo
        this.opacity += (Math.random() - 0.5) * 0.02
        this.opacity = Math.max(0.1, Math.min(0.8, this.opacity))
      }

      draw() {
        ctx.save()
        ctx.globalAlpha = this.opacity
        ctx.fillStyle = `${this.color} 1)`
        ctx.shadowBlur = 10
        ctx.shadowColor = `${this.color} 0.8)`
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    }

    // Crear partículas (menos en móviles)
    const count = window.innerWidth < 768 ? Math.floor(particleCount / 2) : particleCount
    for (let i = 0; i < count; i++) {
      particles.push(new Particle())
    }

    // Animación
    const animate = () => {
      // Fondo con gradiente
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, '#e74c3c')
      gradient.addColorStop(0.5, '#c0392b')
      gradient.addColorStop(1, '#2c3e50')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Actualizar y dibujar partículas
      particles.forEach(particle => {
        particle.update()
        particle.draw()
      })

      // Conexiones entre partículas cercanas (opcional)
      connectParticles()

      animationFrameId = requestAnimationFrame(animate)
    }

    // Conectar partículas cercanas
    const connectParticles = () => {
      const maxDistance = 150
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < maxDistance) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * (1 - distance / maxDistance)})`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
    }

    animate()

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [particleCount, colors, speed])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none'
      }}
    />
  )
}