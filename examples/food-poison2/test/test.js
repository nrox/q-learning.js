

describe("Food/Poison", () => {

    it("Agent", () => {
        let hero = new Agent(2, 3)
        expect(hero.row).toBe(2)
        expect(hero.col).toBe(3)
        expect(hero.type).toBe(1)
        hero.setPosition(4,5)
        expect(hero.row).toBe(4)
        expect(hero.col).toBe(5)
    })

    it("Food", () => {
        let food = new Food(2, 3)
        expect(food.row).toBe(2)
        expect(food.col).toBe(3)
        expect(food.type).toBe(2)
        food.setPosition(4,5)
        expect(food.row).toBe(4)
        expect(food.col).toBe(5)
    })
    
    it("Poison", () => {
        let poison = new Poison(2, 4)
        expect(poison.type).toBe(3)
    })
  
    it("Board.init", () => {
        let board = new Board(11, 12)
        board.init()
        expect(board.numRows).toBe(11)
        expect(board.numColumns).toBe(12)
        expect(board.hero).not.toBe(undefined)
    })

    it("Board.getState", () => {
        let board = new Board(11, 12)
        board.init()
        let set = new Set
        for (let i = 0; i < 1000; i++){
            board.addMoreFood()
            board.moveFoodDown()
            set.add(board.getState())
        }
        expect(set.size>2).toBe(true)
        expect(set.has("S000000")).toBe(true)
    })
            
    it("Board.addMoreFood", () => {
        let density = 1.0
        let board = new Board(10, 10, density, 0.5)
        board.init()
        board.addMoreFood()
        for (let c = 0; c < 10; c++){
            expect(board.board[0][c] instanceof Empty).toBe(false)
            expect(board.board[1][c] instanceof Empty).toBe(true)
        }
        density = 0.0
        board = new Board(10, 10, density, 0.5)
        board.init()
        board.addMoreFood()
        for (let c = 0; c < 10; c++){
            expect(board.board[0][c] instanceof Empty).toBe(true)
        }
    })

    it("Board.moveFoodDown", () => {
        let density = 1.0
        let board = new Board(10, 10, density, 0.5)
        board.init()
        board.addMoreFood()
        board.moveFoodDown()
        expect(board.board[1][0] instanceof Empty).toBe(false)
        expect(board.board[1][3]).toBe(board.board[0][3])
        for (let c = 0; c < 10; c++){
            expect(board.board[1][c] instanceof Empty).toBe(false)
            expect(board.board[1][c]).toBe(board.board[0][c])
        }
    })

    it("CanvasPainter", () => {
        let board = new Board(10, 10, 0.5, 0.5)
        board.init()
        for (let i = 0; i < 10; i++){
            board.addMoreFood()
            board.moveFoodDown()
        }
        let painter = new CanvasPainter(board)
        painter.init()
        painter.draw(1000)
    })

    it("...", () => {
        expect(true).toBe(true)
    })
})
      
  
  