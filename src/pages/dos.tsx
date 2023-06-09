import React, { useEffect, useRef, useState } from 'react'
import './dos.scss';
import DosText from '../assets/elements/dos-text/dos-text';
import DosCurrentLine from '../assets/elements/dos-currentline/dos-currentline';
import handleCommand, { Command, CommandList } from '../obj/command/command';
import { DirectoryContext } from '../context/context';
import DEFAULT_COMMANDS from '../obj/command/_default_commands';
import { FileSystem } from '../obj/directorytree/Directory';



/**
 * @summary This function returns a dospage object, which should be the entire page, at some point there will be a context for the directory header for the new line.
 * @returns DosPage Element
 */
function DosPage() {

    const [curDirectory, setCurrentDirectory] = useState("C:/>");
    const [oldCommands, setOldCommands] = useState<string[]>([]);
    const ref = useRef<HTMLDivElement>(null);
    const root = new FileSystem();

    /**
     * @summary Simple function that creates and assigns commands their functions...
     */
    const commandConfigs = () => {
        CommandList.getCommand("help")?.overrideCall(() => {
            var outputstring = "";
            outputstring += "=#=#=#=#=#=#=#=DOS-WEB-DEFAULT HELP=#=#=#=#=#=#=#=\n";
            const commands = CommandList.getAllCommands();
            for(let i = 0; i < commands.length; i++) {
                const cmd : Command = commands[i];
                outputstring += `${cmd.getName()} - ${cmd.getDescription()}\n`;
            }
            outputstring += "=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#==#=#=#=#=#=#=#=\n";

            return outputstring;
        });
        CommandList.addCommandListener("cd", {name: "changedir", function: () => {
            const responseValue = root.getCurrentPath();
            setCurrentDirectory(`C:${responseValue.substring(0, responseValue.length - 1)}>`);
        }});
    }

    useEffect(() => {
        DEFAULT_COMMANDS(root);
        commandConfigs();
    }, []);


    useEffect(() => {
        //scroll to the bottom when a new line is printed
        if (ref.current)
            ref.current.scrollTop = ref.current.scrollHeight;
    }, [oldCommands])

    //onenter function passed into DosCurrentLine
    const onEnterDos = (command: string) => {
        const _mutated_command = command.trim().split(/\s+/);
        const _real_command = _mutated_command[0].trim();
            const pushCommandToStack = (_command: string, stack: any[]) => {
            var temp = [...stack];
            if (temp.at(temp.length - 1) === _command)
                return stack;
            if (_command === " " || _command === "")
                temp.push(String.fromCharCode(160));
            else
                temp.push(_command);
            return temp;
        }
        pushCommandToStack(_real_command, oldCommands);

        //set the state of the function
        const setCMDState = (_command: string) => {
            setOldCommands((preventry: any) => {
                return pushCommandToStack(_command, preventry);
            });
        }
        const _args_passthrough = _mutated_command.splice(1, _mutated_command.length - 1);
        setCMDState(command);
        handleCommand([_real_command], _args_passthrough, (_command: string) => setCMDState(_command));

        return '';
    }


    return (
        <DirectoryContext.Provider value={{state:curDirectory, setState:setCurrentDirectory}}>
            <div className='dos-command-page' ref={ref as React.RefObject<HTMLDivElement>}>
                <div className='dos-command-container'>
                    {oldCommands.map(d => (
                        <DosText text={d} color='white' />
                    ))}
                    <DosCurrentLine text={curDirectory} onEnter={(command) => { onEnterDos(command); return ""; }} />
                </div>
            </div>
        </DirectoryContext.Provider>
    )
}

export default DosPage
