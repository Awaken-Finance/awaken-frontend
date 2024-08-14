import AElf from './aelf';
import * as protobuf from '@aelfqueen/protobufjs/light';
import coreDescriptor from 'constants/proto/core.json';

export const coreRootProto: any = protobuf.Root.fromJSON(coreDescriptor);

function decodeBase64(str: string) {
  const { util } = AElf.pbjs;
  const buffer = util.newBuffer(util.base64.length(str));
  util.base64.decode(str, buffer, 0);
  return buffer;
}

export const getEventLog = (log: any, type = 'Swap') => {
  const dataType = coreRootProto.get(type);
  const { Indexed = [], NonIndexed } = log;
  const serializedData = [...(Indexed || [])];
  if (NonIndexed) {
    serializedData.push(NonIndexed);
  }
  let deserializeLogResult = serializedData.reduce((acc, v) => {
    let deserialize = dataType.decode(decodeBase64(v));
    deserialize = dataType.toObject(deserialize, {
      enums: String, // enums as string names
      longs: String, // longs as strings (requires long.js)
      bytes: String, // bytes as base64 encoded strings
      defaults: false, // includes default values
      arrays: true, // populates empty arrays (repeated fields) even if defaults=false
      objects: true, // populates empty objects (map fields) even if defaults=false
      oneofs: true, // includes virtual oneof fields set to the present field's name
    });
    return {
      ...acc,
      ...deserialize,
    };
  }, {});
  deserializeLogResult = AElf.utils.transform.transform(
    dataType,
    deserializeLogResult,
    AElf.utils.transform.OUTPUT_TRANSFORMERS,
  );
  deserializeLogResult = AElf.utils.transform.transformArrayToMap(dataType, deserializeLogResult);

  return deserializeLogResult;
};

export const getLog = (Logs: any = [], type: string) => {
  if (!Array.isArray(Logs) || Logs.length === 0) {
    return [];
  }
  return Logs.filter((log) => log.Name === type).map((v) => getEventLog(v, type));
};
