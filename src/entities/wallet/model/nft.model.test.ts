import axios from 'axios';
import { refineList } from './nft.model';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const createNft = (thumbnailUrl: string | null = 'https://example.com/nft.png', name = 'TestNFT') =>
  ({
    name,
    image: { thumbnailUrl },
  }) as any;

describe('nft model', () => {
  describe('refineList', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('이미지 헬스체크 통과한 NFT만 반환', async () => {
      mockedAxios.get.mockResolvedValue({ status: 200 });

      const result = await refineList([createNft('https://ok.com/1.png', 'NFT1')]);

      expect(result).toEqual([
        {
          name: 'NFT1',
          resourceUri: 'https://ok.com/1.png',
          available: true,
        },
      ]);
    });

    test('이미지 헬스체크 실패한 NFT는 제외', async () => {
      mockedAxios.get.mockRejectedValue(new Error('network error'));

      const result = await refineList([createNft('https://fail.com/1.png')]);

      expect(result).toEqual([]);
    });

    test('thumbnailUrl이 없는 NFT는 제외', async () => {
      const result = await refineList([createNft(null)]);

      expect(result).toEqual([]);
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    test('여러 NFT 중 성공/실패 혼합', async () => {
      mockedAxios.get
        .mockResolvedValueOnce({ status: 200 })
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce({ status: 200 });

      const result = await refineList([
        createNft('https://ok1.com/1.png', 'A'),
        createNft('https://fail.com/2.png', 'B'),
        createNft('https://ok2.com/3.png', 'C'),
      ]);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('A');
      expect(result[1].name).toBe('C');
    });

    test('빈 배열이면 빈 배열 반환', async () => {
      const result = await refineList([]);
      expect(result).toEqual([]);
    });
  });
});
