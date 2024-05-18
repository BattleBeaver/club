import { ModeToggle } from "./mode-toggle";

type RoomIdProps = {
  roomId: string;
  numberOfPlayers: string;
  clientId: string;
};

const spanStyle = "p-1 ml-2 bg-orange-400 rounded-sm text-slate-50 text-lg";

const UserDetails = ({ clientId, roomId, numberOfPlayers }: RoomIdProps) => {
  return (
    <div className="flex flex-row justify-between p-2 bg-slate-600 items-center text-slate-200 font-semibold text-base">
      <div className="flex flex-row gap-3">
        <div>
          ID: <span className={spanStyle}>{clientId}</span>
        </div>
        {roomId && (
          <div className="flex flex-row gap-3">
            <div>
              Room ID: <span className={spanStyle}>{roomId}</span>
            </div>
            <div>
              Players: <span className={spanStyle}>{numberOfPlayers}</span>{" "}
            </div>
          </div>
        )}
      </div>
      <ModeToggle></ModeToggle>
    </div>
  );
};

export default UserDetails;
