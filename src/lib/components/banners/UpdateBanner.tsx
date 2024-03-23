/* eslint-disable camelcase */
import type { ReactElement } from "react";
import { useState } from "react";
import { Banner, Button, Dialog, Portal, ProgressBar, Text } from "react-native-paper";
import { useAsync } from "../../hooks/useAsync";
import { APP_VERSION } from "../../../../v";
import { supabase } from "../../db/supabase";
import type { Database } from "../../db/supabase.types";
import RNFetchBlob from "rn-fetch-blob";
import ApkInstallerModule from "../../../../apkinstaller";

type Version = Database["public"]["Tables"]["versions"]["Row"];

export const UpdateBanner = (): ReactElement => {
  const [updateAvailable, setUpdateAvailable] = useState<Version>({
    changelog: "",
    version_code: "",
    version_uuid: ""
  });
  const [showModal, setShowModal] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0.14);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  setInterval(() => {
    if (downloading) {
      setDownloadProgress((prev) => prev + 0.01);
    }
  }, 1000);

  useAsync(async() => {
    const { data, error } = await supabase.rpc("latest_version", { given_version_code: APP_VERSION });
    if (error) throw error;
    if (!data) return;

    if (data.length === 0) return;
    setUpdateAvailable(data[0]);
  }, []);

  const downloadApk = (): void => {
    const { data } = supabase.storage.from("versions").getPublicUrl(`${updateAvailable.version_code}.apk`);
    if (!data) return;

    console.log(data.publicUrl);

    RNFetchBlob.config({
      fileCache: true,
      path: `${RNFetchBlob.fs.dirs.DownloadDir}/mitwill-${updateAvailable.version_code}.apk`,
      overwrite: true
    })
      .fetch("GET", data.publicUrl)
      .progress((received, total) => {
        setDownloadProgress(received / total);
      })
      .then((res) => {
        console.log("The file saved to ", res.path());
        setDownloading(false);
        setDownloaded(true);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        ApkInstallerModule.installApk(`${res.path()}`);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <>
      <Portal>
        <Dialog
          visible={showModal}
          onDismiss={() => setShowModal(false)}
          dismissable={!downloading && !downloaded}
        >
          <Dialog.Title>Mise à jour disponible</Dialog.Title>

          <Dialog.Content>
            <Text style={{ margin: 10 }}>
            Nouvelle version : {updateAvailable.version_code}
            </Text>

            <ProgressBar animatedValue={downloadProgress} visible={downloading} />
          </Dialog.Content>

          <Dialog.Actions>
            <Button onPress={() => {
              setDownloading(true);
              void downloadApk();
            }}>Télécharger</Button>

            <Button onPress={() => {
              setShowModal(false);
              setDownloading(false);
              setDownloaded(false);
            }}>Annuler</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Banner
        visible={!!updateAvailable.version_code}
        actions={[
          { label: "Télécharger", onPress: () => setShowModal(true) }
        ]}
      >
        Une nouvelle version de l'application est disponible, veuillez la télécharger pour profiter des dernières fonctionnalités.
      </Banner>
    </>
  );
};