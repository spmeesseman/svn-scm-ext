import * as os from "os";
import * as path from "path";
import { Uri } from "vscode";
import { writeFileSync, mkdirSync } from "fs";
import * as crypto from "crypto";
import { iconv } from "./vscodeModules";
import { configuration } from "./configuration";
import { pathExists } from "./util";

export const tempdir = path.join(
  os.tmpdir(),
  `vscode-svn-${os.userInfo().uid.toString()}`
);

export async function createTempFile(
  svnUri: Uri,
  revision: string,
  payload: string,
  ext? : string
): Promise<Uri> {
  if (!pathExists(tempdir)) {
    mkdirSync(tempdir, { mode: 0o770 });
  }

  let fname = `r${revision}_${path.basename(svnUri.fsPath)}`;
  if (ext) {
    fname = fname + "." + ext;
  }
  const hash = crypto.createHash("md5");
  const data = hash.update(svnUri.path);
  const filePathHash = data.digest("hex");
  const encoding = configuration.get<string>("default.encoding");

  if (!pathExists(path.join(tempdir, filePathHash))) {
    mkdirSync(path.join(tempdir, filePathHash), { mode: 0o770 });
  }

  const fpath = path.join(tempdir, filePathHash, fname);
  if (encoding) {
    const encodedPayload = iconv.encode(payload, encoding);
    writeFileSync(fpath, encodedPayload);
  } else {
    writeFileSync(fpath, payload);
  }
  return Uri.file(fpath);
}
