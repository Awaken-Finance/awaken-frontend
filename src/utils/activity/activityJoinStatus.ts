export const ACTIVITY_JOIN_STATUS_MAP = 'ACTIVITY_JOIN_STATUS_MAP';
export type TActivityJoinStatus = {
  address: string;
  serviceId: string;
};

export const getActivityLocalJoinStatusMap = (): Record<string, TActivityJoinStatus> => {
  try {
    const statusMapStr = localStorage.getItem(ACTIVITY_JOIN_STATUS_MAP);
    const statusMap = JSON.parse(statusMapStr || '');
    return statusMap || {};
  } catch (error) {
    console.log('getActivityJoinStatusMap error', error);
    return {};
  }
};

export const getActivityLocalJoinStatus = (pageId: string, { address, serviceId }: TActivityJoinStatus) => {
  try {
    const statusMap = getActivityLocalJoinStatusMap();
    const status = statusMap[pageId];
    if (status.address !== address || status.serviceId !== serviceId) return false;
    return true;
  } catch (error) {
    console.log('getActivityJoinStatus error', error);
    return false;
  }
};

export const setActivityLocalJoinStatus = (pageId: string, status: TActivityJoinStatus) => {
  try {
    const statusMap = getActivityLocalJoinStatusMap();
    statusMap[pageId] = status;
    const statusMapStr = JSON.stringify(statusMap);
    localStorage.setItem(ACTIVITY_JOIN_STATUS_MAP, statusMapStr);
  } catch (error) {
    console.log('setActivityJoinStatus error', error);
  }
};

export const resetActivityLocalJoinStatus = () => {
  localStorage.removeItem(ACTIVITY_JOIN_STATUS_MAP);
};
