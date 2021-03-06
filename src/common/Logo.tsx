import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  title: {
    fontSize: '30px',
    backgroundImage:
      '-webkit-gradient(linear, 0 0, 0 bottom, from(#0b52cb), to(#0031e5))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
});

const Logo: React.FC<{
  size?: number;
}> = props => {
  const classes = useStyles();
  const { size = 30 } = props;

  return (
    <div style={{ fontSize: `${size}px` }} className={classes.title}>
      Proxy
    </div>
  );
};

export default Logo;
