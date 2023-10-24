// //uuid.roomInfo.userList 객체에서 clientId3
// const socketModel = {
//   socketId: 'slkdjads',
//   uuid: 'dflksjkflsdf',
//   nickname : 'fljsfdf',
// };

// const RoomModel = {
//   uuid: 'ddtfn4rjhnk3',
//   owner: 'socket.id',
//   userList: {
//     clientid1: { nickname: '민정' },
//     clientid2: { nickname: '민정2' },
//     clientid3: { nickname: '민정3' },
//   },
// };

// async disconnectClient(client: Socket, server: Server) {
//   //clientId 바탕으로 방정보 찾음 uuid 찾음
//   const user = await this.socketModel.findOne({ clientId: client.id });
//   const uuid = user.uuid;
//   const nickname = user.nickname;
//   await this.socketModel.findOneAndDelete({ clientId: client.id }).exec();

//   const data = await this.roomModel.findOne({ uuid: uuid });
//   if (!data) {
//     return server
//       .to(client.id)
//       .emit('error-room', '해당되는 방을 찾을 수 없습니다.');
//   }
//   delete data.userList[client.id];
//   await this.roomModel.findOne({ uuid: uuid }).then((room) => {
//     room = data;
//     return room.save();
//   });
//   if (!user) {
//     return server
//       .to(client.id)
//       .emit('error-room', '해당되는 클라이언트 ID를 찾을 수 없습니다.');
//   } else {
//     server.to(uuid).emit('disconnect_user', nickname);
//     this.logger.log(`disconnected : ${client.id}`);
//   }
