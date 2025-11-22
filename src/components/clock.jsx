import { useState, useEffect } from 'react';

function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Update the time every second
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Clean up the interval on component unmount
    return () => clearInterval(timer);
  }, []);

  // Format the time as HH:MM:SS
  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  return (
    <div style={{
      color:"white",
      background:"black",
      width:"200px",
      textAlign:"center",
      height:"50px",
      display:"flex",
      alignItems:"center",
      justifyContent:"center"
    }}>
      {formattedTime}
    </div>
  );
}

export default Clock;
