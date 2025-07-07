import { useEffect, useState } from 'react';
import { getTokens } from '@services/tokens.service';

const useGetTokens = () => {
  const [tokens, setTokens] = useState([]);

  const fetchTokens = async () => {
    const result = await getTokens();
    const tokensArray = result?.data ?? result ?? [];
    setTokens(tokensArray);
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  return { tokens, fetchTokens, setTokens };
};

export default useGetTokens;
