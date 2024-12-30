const Shortcut = ({ commandRunner, commands, icon, name }) => {
    
    const onClick = () => {
        for (const command of commands) {
            commandRunner(command);
        }
    }
    
    return (
        <button className="shortcut" onClick={() => onClick()}>
            <i className={`nf ${icon}`}></i>
            <span>{name}</span>
        </button>
    );
};

export default Shortcut;