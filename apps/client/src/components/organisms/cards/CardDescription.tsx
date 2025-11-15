import Typography from '@mui/material/Typography';

const CardDescription = ({ desc }: { desc: string }) => {
  if (
    desc.includes('[ Pendulum Effect ]') &&
    desc.includes('[ Monster Effect ]')
  ) {
    const pendulumMatch = desc.match(
      /\[ Pendulum Effect \](.*?)\[ Monster Effect \]/s,
    );
    const monsterMatch = desc.match(/\[ Monster Effect \](.*)/s);
    const pendulumText = pendulumMatch ? pendulumMatch[1].trim() : '';
    const monsterText = monsterMatch ? monsterMatch[1].trim() : '';
    return (
      <Typography variant="body2" component="div" noWrap={false}>
        <strong>Pendulum Effect</strong>
        <br />
        {pendulumText.split(/\r?\n/).map((line, idx) => (
          <span key={`pendulum-${idx}`}>
            {line}
            <br />
          </span>
        ))}
        <br />
        <strong>Monster Effect</strong>
        <br />
        {monsterText.split(/\r?\n/).map((line, idx) => (
          <span key={`monster-${idx}`}>
            {line}
            <br />
          </span>
        ))}
      </Typography>
    );
  }
  return (
    <Typography variant="body2" component="div" noWrap={false}>
      {desc.split('\r\n').map((line, index) => (
        <span key={`card-description-${index}`}>
          {line}
          <br />
        </span>
      ))}
    </Typography>
  );
};

export default CardDescription;
