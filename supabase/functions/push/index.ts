import { createClient } from "npm:@supabase/supabase-js@2";
import { JWT } from "npm:google-auth-library@9";
import serviceAccount from "../service-account.json" with { type: 'json' }

interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  action?: string;
  IS_DEV?: boolean;
}

interface WebhookPayload {
  type: "INSERT";
  table: string;
  record: Notification;
  schema: "public";
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const FCM_DEVICE_TOKEN = "c-jNQ-HaQlO2enzEI29fVY:APA91bHtHkH0YQAZ2GRE87z1y-wt68kyLSW6du0IBO6OFJBl1SnwPWcW3bPM-puN2B_ahaNQngr5l_ArhlEeLE5OCRV8_q-G0gyc9zlRpm-pbdRrCBoJXiUMYRW394RKYKnER_IAAOBD";

Deno.serve(async(req) => {
  const payload: WebhookPayload = await req.json();

  const { data } = await supabase
    .from("users")
    .select("fcm_token")
    .eq("userId", payload.record.user_id)
    .single();

  const fcmToken = data.fcm_token as string;

  const accessToken = await getAccessToken({
    clientEmail: serviceAccount.client_email,
    privateKey: serviceAccount.private_key
  });

  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        message: {
          token: payload.record.IS_DEV ? FCM_DEVICE_TOKEN : fcmToken,
          data: {
            action: payload.record.action
          },
          notification: {
            title: payload.record.title,
            body: payload.record.body
          }
        }
      })
    }
  );

  const resData = await res.json();
  if (res.status < 200 || 299 < res.status) {
    throw resData;
  }

  return new Response(JSON.stringify(resData), {
    headers: { "Content-Type": "application/json" }
  });
});

const getAccessToken = ({
  clientEmail,
  privateKey
}: {
  clientEmail: string;
  privateKey: string;
}): Promise<string> => {
  return new Promise((resolve, reject) => {
    const jwtClient = new JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/firebase.messaging"]
    });
    jwtClient.authorize((err, tokens) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(tokens.access_token!);
    });
  });
};