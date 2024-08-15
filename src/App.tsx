import { useEffect, useRef, useState } from 'react';
import './App.css';

const MAX_POINTS = 10000;

interface TimerProps {
  startedAt: number | null;
  isFinished: boolean;
}

function Timer({ startedAt, isFinished }: TimerProps) {
  const [time, setTime] = useState(0);
  const timeInSecs = (time / 1000).toFixed(1);

  useEffect(() => {
    if (startedAt === null) {
      return;
    }

    const interval = setInterval(() => {
      setTime((prevTime) => prevTime + 100);
    }, 100);

    if (isFinished) {
      clearInterval(interval);
      return;
    }

    return () => clearInterval(interval);
  }, [startedAt, isFinished]);

  return <span>{timeInSecs}s</span>;
}

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

function drawPoints(
  frame: Element,
  points?: number,
  onClick?: (value: number) => void,
) {
  frame.innerHTML = '';

  if (!points) {
    return;
  }

  const pointSize = 48;
  const width = frame.clientWidth - pointSize;
  const height = frame.clientHeight - pointSize;
  for (let i = points; i > 0; i--) {
    const randomX = getRandomInt(width);
    const randomY = getRandomInt(height);
    const point = document.createElement('button');
    point.innerText = String(i);
    point.classList.add('point');
    point.style.width = pointSize + 'px';
    point.style.height = pointSize + 'px';
    point.style.left = randomX + 'px';
    point.style.top = randomY + 'px';
    point.setAttribute('data-next', String(i - 1));
    point.addEventListener('click', function () {
      this.remove();
      onClick?.(i);
    });

    frame.appendChild(point);
  }
}

function App() {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const totalPoints = useRef<number>();
  const targetPoint = useRef<number>();
  const [result, setResult] = useState<boolean>();
  const isFinished = typeof result === 'boolean';

  const reset = () => {
    setStartedAt(null);
    setResult(undefined);
    totalPoints.current = undefined;
    targetPoint.current = 1;
  };

  const onChangeInput: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const value = e.target.value;

    if (value === '') {
      setInputValue('');

      return;
    }

    const parsedValue = Math.abs(parseInt(e.target.value));
    if (Number.isNaN(parsedValue)) {
      alert('Please enter a valid number!');
      setInputValue('');

      return;
    }

    if (parsedValue > MAX_POINTS) {
      alert(`Please enter a valid number less than ${MAX_POINTS}!`);
      setInputValue('');

      return;
    }

    setInputValue(value);
  };

  const onRestart = () => {
    if (!inputValue) {
      alert('Please enter number of points!');
      reset();

      return;
    }

    setStartedAt(new Date().getTime());
    setResult(undefined);
    totalPoints.current = parseInt(inputValue);
    targetPoint.current = 1;

    if (typeof window === 'undefined') {
      return;
    }

    const frame = document.querySelector('.frame');

    if (frame) {
      drawPoints(frame, totalPoints.current, (value) => {
        if (value !== targetPoint.current) {
          setResult(false); // lose
        } else if (value === totalPoints.current) {
          setResult(true); // win
        } else {
          targetPoint.current = value + 1;
        }
      });
    }
  };

  return (
    <main>
      <div className='header'>
        {result === undefined && <h2>LET'S PLAY</h2>}
        {result === true && <h2 className='win'>ALL CLEARED</h2>}
        {result === false && <h2 className='lose'>GAME OVER</h2>}
      </div>
      <div className='form'>
        <div className='formItem'>
          <label htmlFor='points'>Points: </label>
          <input id='points' value={inputValue} onChange={onChangeInput} />
        </div>
        <div className='formItem'>
          <label htmlFor='points'>Time: </label>
          <Timer
            key={startedAt}
            startedAt={startedAt}
            isFinished={isFinished}
          />
        </div>

        <button onClick={onRestart}>{startedAt ? 'Restart' : 'Play'}</button>
      </div>

      <div className='frame'></div>
    </main>
  );
}

export default App;
