import React from 'react';
import ReactDOM from 'react-dom';
import ArcProgress from '../src/arc-progress';


interface IAppProps {}
interface IAppState {}

import { arcProgress, arcProgress2, arcProgress4 } from './demos';
import '../static/style.css';

class App extends React.Component<IAppProps, IAppState> {
  state = {
    progress : .4,
    text: '1200',
    text4: '78.26',
    progress4: .7826,
  };
  addProgress = () => {
    this.setState({ progress: .9, text: '1800' });
  }

  addProgress3 = () => {
    this.setState({ progress: 0, text: '0' });
  }

  public render(): JSX.Element {
    const { progress4, text4 } = this.props;
    return (
      <div>
        <ArcProgress
          key={1}
          {...arcProgress}
          observer={(e, t) => {
            // console.log('observer:', e, t);
          }}
          animationEnd={(e) => {
            // console.log('animationEnd', e);
          }}
        >
          <button onClick={this.addProgress}>addProgress</button>
          <button onClick={this.addProgress3}>addProgress3</button>
        </ArcProgress>
        <ArcProgress
          key={2}
          {...arcProgress2}
        />
        {/*<ArcProgress*/}
          {/*{...arcProgress3}*/}
          {/*lineCap="round"*/}
        {/*/>*/}
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
