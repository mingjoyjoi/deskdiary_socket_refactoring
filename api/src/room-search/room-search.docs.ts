import { ApiQueryOptions, ApiResponseOptions } from '@nestjs/swagger';

export class RoomAPIDocs {
  static getRoomListByTypeQueryFilter(): ApiQueryOptions {
    return {
      name: 'filter',
      example: 'popularity(인기순) 혹은 latest(최신순)',
      description:
        '인기순 or 최신순으로 조회합니다. 쿼리스트링 없을 경우 기본은 인기순 조회.',
    };
  }

  static getRoomListByTypeQueryPage(): ApiQueryOptions {
    return {
      name: 'page',
      example: 2,
      description: '페이지를 나타냅니다. 쿼리스트링이 없을 경우 기본값은 1',
    };
  }

  static getRoomListByTypeQueryPerPage(): ApiQueryOptions {
    return {
      name: 'perPage',
      example: 10,
      description:
        '한 페이지당 가져올 데이터의 수를 정합니다. 쿼리스트링이 없을 경우 기본값은 10',
    };
  }

  static getRoomListByTypeQuerySearch(): ApiQueryOptions {
    return {
      name: 'search',
      example: '오버워치',
      description: '방제목을 검색합니다.',
    };
  }

  static getRoomListBySearch(): ApiResponseOptions {
    return {
      status: 200,
      description: `
      QueryResult는 방정보 데이터들을 가져옵니다.
      nowCount는 지금까지 받은 방정보 데이터의 갯수를 가져옵니다.
      totalCount는 모든 방정보 데이터의 갯수를 나타냅니다.
      remainingCount는 앞으로 더 가져올 수 있는 남은 방정보 데이터의 갯수를 나타냅니다.`,
    };
  }
}
