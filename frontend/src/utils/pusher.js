import Pusher from "pusher-js";

const PUSHER_KEY = "d44e3d910d38a928e0be";
const PUSHER_CLUSTER = "eu";

export const initPusher = () => {
  const token = localStorage.getItem("access_token");

  return new Pusher(PUSHER_KEY, {
    cluster: PUSHER_CLUSTER,
    authEndpoint: "https://frontend-test-api.aircall.dev/pusher/auth",
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
};
