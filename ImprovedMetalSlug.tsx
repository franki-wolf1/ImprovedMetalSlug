'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"

type EntityType = 'soldier' | 'tank' | 'aircraft'

type Entity = {
  id: number
  x: number
  y: number
  direction: 'left' | 'right'
  type: EntityType
}

export default function ImprovedMetalSlug() {
  const [player, setPlayer] = useState<Entity>({ id: 0, x: 50, y: 0, direction: 'right', type: 'soldier' })
  const [bullets, setBullets] = useState<Entity[]>([])
  const [enemies, setEnemies] = useState<Entity[]>([])
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameOver, setGameOver] = useState(false)
  const [flash, setFlash] = useState<'shoot' | 'explode' | null>(null)

  const movePlayer = useCallback((direction: 'left' | 'right') => {
    setPlayer(prev => ({
      ...prev,
      x: direction === 'left' ? Math.max(0, prev.x - 5) : Math.min(95, prev.x + 5),
      direction
    }))
  }, [])

  const shoot = useCallback(() => {
    setBullets(prev => [...prev, { id: Date.now(), x: player.x, y: 10, direction: player.direction, type: 'soldier' }])
    setFlash('shoot')
    setTimeout(() => setFlash(null), 100)
  }, [player])

  const spawnEnemy = useCallback(() => {
    const x = Math.random() * 100
    const y = Math.random() * 60 + 20 // Spawn between 20% and 80% of screen height
    const direction = Math.random() > 0.5 ? 'left' : 'right'
    const type: EntityType = ['soldier', 'tank', 'aircraft'][Math.floor(Math.random() * 3)] as EntityType
    setEnemies(prev => [...prev, { id: Date.now(), x, y, direction, type }])
  }, [])

  useEffect(() => {
    if (gameOver) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') movePlayer('left')
      if (e.key === 'ArrowRight') movePlayer('right')
      if (e.key === ' ') shoot()
    }

    const gameLoop = setInterval(() => {
      setBullets(prev => prev.map(b => ({ ...b, y: b.y + 5 })).filter(b => b.y < 100))
      setEnemies(prev => prev.map(e => ({
        ...e,
        x: e.direction === 'left' ? e.x - (e.type === 'aircraft' ? 2 : 1) : e.x + (e.type === 'aircraft' ? 2 : 1),
        direction: e.x <= 0 ? 'right' : e.x >= 95 ? 'left' : e.direction
      })))

      // Collision detection
      setBullets(prev => prev.filter(b => {
        const hitEnemy = enemies.find(e => Math.abs(e.x - b.x) < 5 && Math.abs(e.y - b.y) < 5)
        if (hitEnemy) {
          setEnemies(prev => prev.filter(e => e.id !== hitEnemy.id))
          setScore(s => s + (hitEnemy.type === 'soldier' ? 10 : hitEnemy.type === 'tank' ? 20 : 30))
          setFlash('explode')
          setTimeout(() => setFlash(null), 100)
          return false
        }
        return true
      }))

      // Player hit detection
      if (enemies.some(e => Math.abs(e.x - player.x) < 5 && Math.abs(e.y - player.y) < 5)) {
        setLives(l => l - 1)
        if (lives <= 1) setGameOver(true)
        setEnemies([])
        setFlash('explode')
        setTimeout(() => setFlash(null), 100)
      }
    }, 50)

    const enemySpawner = setInterval(spawnEnemy, 2000)

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      clearInterval(gameLoop)
      clearInterval(enemySpawner)
    }
  }, [movePlayer, shoot, spawnEnemy, enemies, player, lives, gameOver])

  const restartGame = () => {
    setPlayer({ id: 0, x: 50, y: 0, direction: 'right', type: 'soldier' })
    setBullets([])
    setEnemies([])
    setScore(0)
    setLives(3)
    setGameOver(false)
  }

  const Hero = ({ x, y, direction }: { x: number; y: number; direction: 'left' | 'right' }) => (
    <g transform={`translate(${x}%, ${100 - y}%) scale(${direction === 'left' ? -1 : 1}, 1)`}>
      <rect width="5" height="10" fill="#4a5568" /> {/* Body */}
      <circle cx="2.5" cy="2" r="2" fill="#f6e05e" /> {/* Head */}
      <rect x="1" y="4" width="3" height="4" fill="#4a5568" /> {/* Torso */}
      <rect x="0" y="8" width="2" height="2" fill="#4a5568" /> {/* Left leg */}
      <rect x="3" y="8" width="2" height="2" fill="#4a5568" /> {/* Right leg */}
      <rect x="4" y="5" width="3" height="1" fill="#718096" /> {/* Gun */}
    </g>
  )

  const Enemy = ({ x, y, direction, type }: { x: number; y: number; direction: 'left' | 'right'; type: EntityType }) => {
    switch (type) {
      case 'soldier':
        return (
          <g transform={`translate(${x}%, ${100 - y}%) scale(${direction === 'left' ? -1 : 1}, 1)`}>
            <rect width="4" height="8" fill="#9b2c2c" /> {/* Body */}
            <circle cx="2" cy="1.5" r="1.5" fill="#fc8181" /> {/* Head */}
            <rect x="0" y="6" width="1.5" height="2" fill="#9b2c2c" /> {/* Left leg */}
            <rect x="2.5" y="6" width="1.5" height="2" fill="#9b2c2c" /> {/* Right leg */}
            <rect x="-1" y="4" width="2" height="1" fill="#fc8181" /> {/* Gun */}
          </g>
        )
      case 'tank':
        return (
          <g transform={`translate(${x}%, ${100 - y}%) scale(${direction === 'left' ? -1 : 1}, 1)`}>
            <rect width="8" height="6" fill="#2c5282" /> {/* Body */}
            <rect x="1" y="-2" width="6" height="2" fill="#2c5282" /> {/* Turret */}
            <rect x="6" y="-1" width="4" height="1" fill="#2c5282" /> {/* Cannon */}
            <circle cx="2" cy="6" r="1" fill="#2c5282" /> {/* Wheel */}
            <circle cx="6" cy="6" r="1" fill="#2c5282" /> {/* Wheel */}
          </g>
        )
      case 'aircraft':
        return (
          <g transform={`translate(${x}%, ${100 - y}%) scale(${direction === 'left' ? -1 : 1}, 1)`}>
            <path d="M0,2 L4,0 L8,2 L4,5 Z" fill="#4299e1" /> {/* Body */}
            <rect x="3" y="1" width="2" height="3" fill="#2b6cb0" /> {/* Cockpit */}
            <rect x="-1" y="2" width="3" height="1" fill="#4299e1" /> {/* Wing */}
            <rect x="6" y="2" width="3" height="1" fill="#4299e1" /> {/* Wing */}
          </g>
        )
    }
  }

  return (
    <div className="relative w-full h-[80vh] bg-gradient-to-b from-blue-300 to-blue-500 overflow-hidden border-b-8 border-green-800">
      {gameOver ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-4">Game Over</h2>
            <p className="text-2xl text-white mb-4">Score: {score}</p>
            <Button onClick={restartGame}>Restart</Button>
          </div>
        </div>
      ) : (
        <>
          <svg className="absolute bottom-0 left-0 w-full h-full" aria-label="Game area">
            <Hero x={player.x} y={player.y} direction={player.direction} />
            
            {bullets.map(bullet => (
              <circle key={bullet.id} cx={`${bullet.x}%`} cy={`${100 - bullet.y}%`} r="1%" fill="yellow" />
            ))}
            
            {enemies.map(enemy => (
              <Enemy key={enemy.id} x={enemy.x} y={enemy.y} direction={enemy.direction} type={enemy.type} />
            ))}
          </svg>
          
          <div className="absolute top-4 left-4 text-white text-xl">
            Score: {score}
          </div>
          <div className="absolute top-4 right-4 text-white text-xl">
            Lives: {lives}
          </div>
          
          <div className="absolute bottom-4 left-4 space-x-2">
            <Button onMouseDown={() => movePlayer('left')} onMouseUp={() => setPlayer(p => ({ ...p, direction: 'left' }))} aria-label="Move left">
              Left
            </Button>
            <Button onMouseDown={() => movePlayer('right')} onMouseUp={() => setPlayer(p => ({ ...p, direction: 'right' }))} aria-label="Move right">
              Right
            </Button>
            <Button onClick={shoot} aria-label="Shoot">Shoot</Button>
          </div>
        </>
      )}
      {flash && (
        <div 
          className={`absolute inset-0 ${flash === 'shoot' ? 'bg-yellow-500' : 'bg-red-500'} opacity-50`}
          style={{animation: 'flash 0.1s'}}
        />
      )}
      <style jsx>{`
        @keyframes flash {
          from { opacity: 0.5; }
          to { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
