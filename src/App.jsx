import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'

function App() {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true)
  const [score, setScore] = useState({ X: 0, O: 0 })
  const [gameOver, setGameOver] = useState(false)
  const [winningLine, setWinningLine] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(true)

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ]

  // Set up dark mode
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark')
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease'
  }, [])

  // Handle theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  const checkWinner = (squares) => {
    for (const line of winningCombinations) {
      const [a, b, c] = line
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        setWinningLine(line)
        return squares[a]
      }
    }
    return null
  }

  const handleClick = (index) => {
    if (board[index] || gameOver) return

    const newBoard = [...board]
    newBoard[index] = isXNext ? '❌' : '⭕'
    setBoard(newBoard)

    const winner = checkWinner(newBoard)
    if (winner) {
      setScore(prev => ({
        ...prev,
        [winner === '❌' ? 'X' : 'O']: prev[winner === '❌' ? 'X' : 'O'] + 1
      }))
      setGameOver(true)
    } else if (!newBoard.includes(null)) {
      setGameOver(true)
    }

    setIsXNext(!isXNext)
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setIsXNext(true)
    setGameOver(false)
    setWinningLine(null)
  }

  const renderCell = (index) => {
    const isWinning = winningLine?.includes(index)
    return (
      <motion.button
        className={`cell ${isWinning ? 'winning' : ''} ${board[index] ? 'filled' : ''}`}
        whileHover={!board[index] && !gameOver ? { scale: 1.1 } : {}}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleClick(index)}
        aria-label={`Cell ${index + 1}, ${board[index] || 'empty'}`}
        tabIndex={0}
      >
        {board[index] && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="cell-content"
          >
            {board[index]}
          </motion.span>
        )}
      </motion.button>
    )
  }

  return (
    <div className="game-container">
      <motion.button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="theme-toggle"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? '☀️' : '🌙'}
      </motion.button>

      <h1 className="game-title">Tic Tac Toe</h1>
      
      <div className="score-board">
        <div>❌: {score.X}</div>
        <div>⭕: {score.O}</div>
      </div>

      <div className="status">
        {gameOver ? (
          winningLine ? 
            `Winner: ${isXNext ? '⭕' : '❌'}` : 
            "It's a draw!"
        ) : (
          `Next player: ${isXNext ? '❌' : '⭕'}`
        )}
      </div>

      <div className="game-board" role="grid">
        {Array(9).fill(null).map((_, i) => (
          <div key={i} role="gridcell">
            {renderCell(i)}
          </div>
        ))}
      </div>

      <motion.button
        onClick={resetGame}
        className="reset-button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Reset game"
      >
        Play Again
      </motion.button>
    </div>
  )
}

export default App
