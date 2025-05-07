import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import './App.css'

function App() {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true)
  const [score, setScore] = useState({ X: 0, O: 0 })
  const [gameOver, setGameOver] = useState(false)
  const [winningLine, setWinningLine] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [gameMode, setGameMode] = useState(null) // 'ai' or 'player'
  const [difficulty, setDifficulty] = useState('medium') // 'easy', 'medium', 'hard'
  const [winner, setWinner] = useState(null)

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

  useEffect(() => {
    if (gameOver) {
      const timer = setTimeout(() => {
        resetGame()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [gameOver])

  const checkWinner = (squares) => {
    for (const line of winningCombinations) {
      const [a, b, c] = line
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a]
      }
    }
    return null
  }

  const getEmptyCells = (squares) => {
    return squares.reduce((acc, cell, index) => {
      if (!cell) acc.push(index)
      return acc
    }, [])
  }

  const evaluateBoard = (squares) => {
    const winner = checkWinner(squares)
    if (winner === '⭕') return 1
    if (winner === '❌') return -1
    return 0
  }

  const minimax = (squares, depth, isMaximizing, alpha = -Infinity, beta = Infinity) => {
    if (checkWinner(squares) || !squares.includes(null) || depth > 6) {
      return evaluateBoard(squares)
    }

    if (isMaximizing) {
      let maxEval = -Infinity
      for (let i = 0; i < squares.length; i++) {
        if (!squares[i]) {
          squares[i] = '⭕'
          const evaluation = minimax(squares, depth + 1, false, alpha, beta)
          squares[i] = null
          maxEval = Math.max(maxEval, evaluation)
          alpha = Math.max(alpha, evaluation)
          if (beta <= alpha) break // Alpha-beta pruning
        }
      }
      return maxEval
    } else {
      let minEval = Infinity
      for (let i = 0; i < squares.length; i++) {
        if (!squares[i]) {
          squares[i] = '❌'
          const evaluation = minimax(squares, depth + 1, true, alpha, beta)
          squares[i] = null
          minEval = Math.min(minEval, evaluation)
          beta = Math.min(beta, evaluation)
          if (beta <= alpha) break // Alpha-beta pruning
        }
      }
      return minEval
    }
  }

  const getBestMove = (squares) => {
    if (difficulty === 'easy') {
      const emptyCells = getEmptyCells(squares)
      return emptyCells[Math.floor(Math.random() * emptyCells.length)]
    }

    if (difficulty === 'medium') {
      const emptyCells = getEmptyCells(squares)
      if (Math.random() < 0.5) {
        return emptyCells[Math.floor(Math.random() * emptyCells.length)]
      }
    }

    let bestScore = -Infinity
    let bestMoves = []
    
    for (let i = 0; i < squares.length; i++) {
      if (!squares[i]) {
        squares[i] = '⭕'
        const score = minimax(squares, 0, false)
        squares[i] = null
        
        if (score > bestScore) {
          bestScore = score
          bestMoves = [i]
        } else if (score === bestScore) {
          bestMoves.push(i)
        }
      }
    }

    return bestMoves[Math.floor(Math.random() * bestMoves.length)]
  }

  const handleClick = (index) => {
    if (board[index] || gameOver || !gameMode) return

    const newBoard = [...board]
    newBoard[index] = isXNext ? '❌' : '⭕'
    setBoard(newBoard)

    const currentWinner = checkWinner(newBoard)
    const isDraw = !newBoard.includes(null)
    
    if (currentWinner || isDraw) {
      if (currentWinner) {
        setWinner(currentWinner)
        setWinningLine(winningCombinations.find(([a, b, c]) => 
          newBoard[a] === currentWinner && newBoard[b] === currentWinner && newBoard[c] === currentWinner
        ))
        setScore(prev => ({
          ...prev,
          [currentWinner === '❌' ? 'X' : 'O']: prev[currentWinner === '❌' ? 'X' : 'O'] + 1
        }))
      }
      setGameOver(true)
      return
    }

    setIsXNext(!isXNext)
    
    // AI move
    if (gameMode === 'ai' && isXNext) {
      setTimeout(() => {
        const aiMove = getBestMove(newBoard)
        if (aiMove !== null) {
          const aiBoard = [...newBoard]
          aiBoard[aiMove] = '⭕'
          setBoard(aiBoard)
          
          const aiWinner = checkWinner(aiBoard)
          const isAiDraw = !aiBoard.includes(null)
          
          if (aiWinner || isAiDraw) {
            if (aiWinner) {
              setWinner(aiWinner)
              setWinningLine(winningCombinations.find(([a, b, c]) => 
                aiBoard[a] === aiWinner && aiBoard[b] === aiWinner && aiBoard[c] === aiWinner
              ))
              setScore(prev => ({
                ...prev,
                [aiWinner === '❌' ? 'X' : 'O']: prev[aiWinner === '❌' ? 'X' : 'O'] + 1
              }))
            }
            setGameOver(true)
          } else {
            setIsXNext(true)
          }
        }
      }, 500)
    }
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setIsXNext(true)
    setGameOver(false)
    setWinningLine(null)
    setWinner(null)
  }

  const startGame = (mode) => {
    setGameMode(mode)
    resetGame()
  }

  const renderCell = (index) => {
    return (
      <motion.button
        className={`cell ${board[index] ? 'filled' : ''}`}
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

  if (!gameMode) {
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
        
        <div className="mode-selection">
          <motion.button
            className="mode-button"
            onClick={() => startGame('player')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Play with Friend
          </motion.button>
          <motion.button
            className="mode-button"
            onClick={() => startGame('ai')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Play with AI
          </motion.button>
        </div>

        {gameMode === 'ai' && (
          <div className="difficulty-selection">
            <button 
              className={`difficulty-button ${difficulty === 'easy' ? 'active' : ''}`}
              onClick={() => setDifficulty('easy')}
            >
              Easy
            </button>
            <button 
              className={`difficulty-button ${difficulty === 'medium' ? 'active' : ''}`}
              onClick={() => setDifficulty('medium')}
            >
              Medium
            </button>
            <button 
              className={`difficulty-button ${difficulty === 'hard' ? 'active' : ''}`}
              onClick={() => setDifficulty('hard')}
            >
              Hard
            </button>
          </div>
        )}
      </div>
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

      <motion.button
        onClick={() => setGameMode(null)}
        className="back-button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        aria-label="Back to menu"
      >
        <span className="back-icon">←</span>
        <span className="back-text">Menu</span>
      </motion.button>

      <h1 className="game-title">Tic Tac Toe</h1>
      
      <div className="score-board">
        <div>❌: {score.X}</div>
        <div>⭕: {score.O}</div>
      </div>

      <div className="status">
        {gameOver ? (
          winner ? 
            `Winner: ${winner}` : 
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
    </div>
  )
}

export default App
