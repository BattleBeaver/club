import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.tsx";

type RoomActionsProps = {
  roomIdInputRef: React.MutableRefObject<HTMLInputElement>;
  createRoom: () => void;
  connectToTheRoom: () => void;
};

const RoomActrions = ({
  createRoom,
  connectToTheRoom,
  roomIdInputRef,
}: RoomActionsProps) => {
  return (
    <div className="w-full mt-4">
      <Card className="bg-slate-600 flex flex-col">
        <CardHeader className="text-center">
          <CardTitle>Room Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-row justify-between gap-3">
          <div className="flex flex-row gap-3 items-center">
            <span className="text-orange-400 bg-slate-800 h-full flex items-center rounded-sm p-2 text-sm font-semibold">
              ID:
            </span>{" "}
            <Input type="text" readOnly value="123" ref={roomIdInputRef} />
          </div>
          <Button variant="outline" onClick={createRoom}>
            Create room
          </Button>
          <Button onClick={connectToTheRoom}>Connect to the room</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoomActrions;
