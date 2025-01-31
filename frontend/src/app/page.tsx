import Homepage from '@/components/Homepage';

import { getApiResponse } from '@/utils/shared/get-api-response';

import { NpmData, PageParams } from '@/types';
import AnnotationTool from '@/components/annotation/annotation';

const AppHome = async ({ searchParams }: PageParams) => {
  return <AnnotationTool />
};

export default AppHome;
