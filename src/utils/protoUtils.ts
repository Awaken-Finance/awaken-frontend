import AElf from './aelf';
import * as protobuf from '@aelfqueen/protobufjs/light';
import coreDescriptor from 'constants/proto/core.json';

const { transform } = AElf.utils;
const pbUtils = AElf.pbUtils;

export const coreRootProto: any = protobuf.Root.fromJSON(coreDescriptor);

export const getEventLog = (base64Str: string, type = 'Swap') => {
  const dataType = coreRootProto[type];
  let deserialize = dataType.decode(Buffer.from(base64Str, 'base64'));
  deserialize = dataType.toObject(deserialize, {
    enums: String, // enums as string names
    longs: String, // longs as strings (requires long.js)
    bytes: String, // bytes as base64 encoded strings
    defaults: true, // includes default values
    arrays: true, // populates empty arrays (repeated fields) even if defaults=false
    objects: true, // populates empty objects (map fields) even if defaults=false
    oneofs: true, // includes virtual oneof fields set to the present field's name
  });
  let deserializeLogResult = transform.transform(dataType, deserialize, transform.OUTPUT_TRANSFORMERS);
  deserializeLogResult = transform.transformArrayToMap(dataType, deserializeLogResult);
  return deserializeLogResult;
};

export const getLog = (Logs: any = [], type: string) => {
  if (!Array.isArray(Logs) || Logs.length === 0) {
    return [];
  }
  return Logs.filter((log) => log.Name === type).map((v) => getEventLog(pbUtils.getSerializedDataFromLog(v), type));
};
