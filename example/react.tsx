import React from 'react';
import ReactDOM from 'react-dom';
import ArcProgress from '../src/arc-progress';

interface IAppProps {}
interface IAppState {
  progress: number;
  text: string;
  progress3: number;
  progress4: number;
  text4: string;
  customText: any;
}

import { arcProgress, arcProgress2, arcProgress3, arcProgress4 } from './demos';
import '../static/style.css';
import { dateFormat } from './utils';

class App extends React.Component<IAppProps, IAppState> {
  constructor(props) {
    super(props);
    const { progress, text: customtext } = this.getTodayProgress();
    this.state = {
      progress: .78,
      text: '6439.68',
      text4: '78.26',
      progress4: .7826,
      customText: [
        { text: customtext, size: '28px', color: '#02ce9c', x: 100, y:98 },
        { text: 'time remaining', size: '16px', color: '#636467', x: 100, y:128 },
      ],
      progress3: progress,
    };
  }

  componentDidMount() {
    let setTime;
    (setTime = () => {
      setTimeout(() => {
        const { progress, text } = this.getTodayProgress();
        const customText = [
          { text, size: '28px', color: '#02ce9c', x: 100, y:98 },
          { text: 'time remaining', size: '16px', color: '#636467', x: 100, y:128 },
        ];
        this.setState({ customText, progress3: progress });

        setTime();
      }, 1000);
    })();
  }

  getTodayProgress = (): any => {
    const oneDayTimeStamp = 86400000;
    const today = new Date();
    const todatTimeStamp = +new Date(today.getFullYear(), today.getMonth(), today.getDate(),
      0, 0, 0, 0);
    const tomorrowTimeStamp = todatTimeStamp + oneDayTimeStamp;
    const todayRemaining = tomorrowTimeStamp - +today;

    const progress = todayRemaining / 86400000;
    const text = dateFormat(todayRemaining + todatTimeStamp, 'hh:mm:ss');

    return { progress, text };
  }

  addProgress = () => {
    this.setState({ progress: .9, text: '1800' });
  }

  addProgress3 = () => {
    this.setState({ progress: 0, text: '0' });
  }

  public render(): JSX.Element {
    const { progress, text, progress3, progress4, text4, customText } = this.state;

    return (
      <div>
        <ArcProgress
          key={1}
          {...arcProgress}
          progress={progress}
          text={text}
          observer={(current) => {
            const { percentage, currentText } = current;
            console.log('observer:', percentage, currentText);
          }}
          animationEnd={({ progress, text }) => {
            console.log('animationEnd', progress, text);
          }}
        >
          <button onClick={() => this.setState({ progress: .89, text: '7347.84' })}>
            increase
          </button>
          <button onClick={() => this.setState({ progress: .31, text: '2559.36' })}>
            decrease
          </button>
        </ArcProgress>
        <ArcProgress
          key={2}
          {...arcProgress2}
        />
        <ArcProgress
          {...arcProgress3}
          progress={progress3}
          customText={customText}
          lineCap="round"
        />
        <ArcProgress
          progress={progress4}
          text={text4}
          {...arcProgress4}
          animationEnd={({ progress }) => {
            setTimeout(() => {
              if (progress === .7826) {
                this.setState({ progress4: .3423, text4: '34.23' });
              } else if (progress === .3423) {
                this.setState({ progress4: .8016, text4: '80.16' });
              }
            }, 500);
          }}
        />

      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
