import React from 'react';
import classes from './students.css';

const students = props => {
  console.log(props.notifications)
  const joinRequests = props.notifications.map(ntf => (
    <div className={classes.Ntf}>
      {ntf.user.username}
    </div>
  ))
  console.log(joinRequests)
  return (
    <div className={classes.Container}>
      <h3>New Requests to Join</h3>
      <div className={classes.Notifications}>
        {joinRequests}
      </div>
    </div>
  )
}

export default students;