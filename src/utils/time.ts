import moment from 'moment';

export const formatTimestamp = (timestamp: string) => {
  const now = moment();
  const inputTime = moment(timestamp);
  const diffHours = now.diff(inputTime, 'hours');

  if (diffHours < 24) {
    return inputTime.format('HH:mm:ss');
  } else {
    const daysDiff = now.diff(inputTime, 'days');
    return `${daysDiff}d ago`;
  }
};
