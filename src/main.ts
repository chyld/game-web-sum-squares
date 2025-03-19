import './style.css';

interface GameState {
  targetNumber: number;
  selectedCells: Map<number, 'positive' | 'negative'>;
  currentSum: number;
  gridNumbers: number[];
  successfulChallenges: number;
  targetRange: number;
}

class SumMatcherGame {
  private state: GameState;
  private gridContainer: HTMLElement = document.createElement('div');
  private targetDisplay: HTMLElement = document.createElement('div');
  private successMessage: HTMLElement = document.createElement('div');
  private scoreDisplay: HTMLElement = document.createElement('div');
  private difficultySelector: HTMLElement = document.createElement('div');

  constructor() {
    console.log('Initializing SumMatcherGame');
    // Initialize state first
    this.state = {
      targetNumber: 25,
      selectedCells: new Map(),
      currentSum: 0,
      gridNumbers: [],
      successfulChallenges: 0,
      targetRange: 30
    };
    // Then create UI elements
    this.initializeGameElements();
    // Finally start the game
    this.startNewGame();
    console.log('Game initialization complete');
  }

  private createDifficultySelector(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'difficulty-selector';

    const label = document.createElement('div');
    label.className = 'difficulty-label';
    label.textContent = 'Target Range:';
    container.appendChild(label);

    const ranges = [10, 20, 30, 40, 50];
    const radioGroup = document.createElement('div');
    radioGroup.className = 'radio-group';

    ranges.forEach(range => {
      const radioContainer = document.createElement('label');
      radioContainer.className = 'radio-container';

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'targetRange';
      input.value = range.toString();
      input.checked = range === this.state.targetRange;
      input.addEventListener('change', () => {
        this.state.targetRange = range;
        this.startNewGame();
      });

      const text = document.createElement('span');
      text.textContent = `±${range}`;

      radioContainer.appendChild(input);
      radioContainer.appendChild(text);
      radioGroup.appendChild(radioContainer);
    });

    container.appendChild(radioGroup);
    return container;
  }

  private initializeGameElements(): void {
    // Get the app container
    const appContainer = document.getElementById('app');
    console.log('Found app container:', appContainer);
    if (!appContainer) {
      console.error('Could not find #app element');
      return;
    }

    // Create game container
    const gameContainer = document.createElement('div');
    gameContainer.className = 'game-container';
    appContainer.appendChild(gameContainer);

    // Create title
    const title = document.createElement('h1');
    title.className = 'game-title';
    title.textContent = 'Sum Matcher';
    gameContainer.appendChild(title);

    // Create score display
    this.scoreDisplay = document.createElement('div');
    this.scoreDisplay.className = 'score-display';
    this.updateScoreDisplay();
    gameContainer.appendChild(this.scoreDisplay);

    // Create difficulty selector
    this.difficultySelector = this.createDifficultySelector();
    gameContainer.appendChild(this.difficultySelector);

    // Create instructions
    const instructions = document.createElement('p');
    instructions.className = 'game-instructions';
    instructions.textContent = 'Click once for positive, twice for negative, third time to deselect. Match the target sum!';
    gameContainer.appendChild(instructions);

    // Create target display
    this.targetDisplay = document.createElement('div');
    this.targetDisplay.className = 'target-display';
    gameContainer.appendChild(this.targetDisplay);

    // Create grid container
    this.gridContainer = document.createElement('div');
    this.gridContainer.className = 'grid-container';
    gameContainer.appendChild(this.gridContainer);

    // Create success message
    this.successMessage = document.createElement('div');
    this.successMessage.className = 'success-message';
    this.successMessage.textContent = 'Great job! 🎉';
    gameContainer.appendChild(this.successMessage);
  }

  private updateScoreDisplay(): void {
    const challenges = this.state.successfulChallenges;
    this.scoreDisplay.textContent = `Challenges completed: ${challenges}`;
  }

  private generateRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private generateGridNumbers(): number[] {
    const numbers: number[] = [];
    // Generate 25 positive numbers (1 to 10)
    for (let i = 0; i < 25; i++) {
      numbers.push(this.generateRandomNumber(1, 10));
    }
    return this.shuffleArray(numbers);
  }

  private shuffleArray(array: number[]): number[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  private updateDisplay(): void {
    const sign = this.state.targetNumber >= 0 ? '+' : '';
    this.targetDisplay.textContent = `Target: ${sign}${this.state.targetNumber}`;
  }

  private handleCellClick(index: number): void {
    const cell = this.gridContainer.children[index] as HTMLElement;
    const number = this.state.gridNumbers[index];
    const currentState = this.state.selectedCells.get(index);

    // Remove previous state's contribution to sum
    if (currentState === 'positive') {
      this.state.currentSum -= number;
    } else if (currentState === 'negative') {
      this.state.currentSum += number;
    }

    // Update state and UI based on current state
    if (!currentState) {
      // First click: Select positive
      this.state.selectedCells.set(index, 'positive');
      this.state.currentSum += number;
      cell.classList.add('selected-positive');
      cell.textContent = `+${number}`;
    } else if (currentState === 'positive') {
      // Second click: Switch to negative
      this.state.selectedCells.set(index, 'negative');
      this.state.currentSum -= number;
      cell.classList.remove('selected-positive');
      cell.classList.add('selected-negative');
      cell.textContent = `-${number}`;
    } else {
      // Third click: Deselect
      this.state.selectedCells.delete(index);
      cell.classList.remove('selected-negative');
      cell.textContent = number.toString();
    }

    this.checkSuccess();
  }

  private checkSuccess(): void {
    if (this.state.currentSum === this.state.targetNumber) {
      this.state.successfulChallenges++;
      this.updateScoreDisplay();
      this.successMessage.classList.add('visible');
      setTimeout(() => {
        this.successMessage.classList.remove('visible');
        this.startNewGame();
      }, 1500);
    }
  }

  private createGrid(): void {
    this.gridContainer.innerHTML = '';
    this.state.gridNumbers.forEach((number, index) => {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.textContent = number.toString();
      cell.addEventListener('click', () => this.handleCellClick(index));
      this.gridContainer.appendChild(cell);
    });
  }

  private startNewGame(): void {
    this.state.selectedCells.clear();
    this.state.currentSum = 0;
    // Generate target number between -targetRange and targetRange (excluding 0)
    let target;
    do {
      target = this.generateRandomNumber(-this.state.targetRange, this.state.targetRange);
    } while (target === 0);
    this.state.targetNumber = target;
    this.state.gridNumbers = this.generateGridNumbers();
    this.createGrid();
    this.updateDisplay();
  }
}

// Initialize the game
console.log('Starting game initialization');
window.addEventListener('load', () => {
  console.log('Window loaded');
  new SumMatcherGame();
});
