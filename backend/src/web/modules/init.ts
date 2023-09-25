import { bannerSchema } from '../../models';
import dayjs from 'dayjs';
import consola from 'consola';

export class initalizer {
  constructor() {
    this.bannerInit();
  }
  private async bannerInit() {
    const check = await bannerSchema.findOne({ banner_id: 1 });
    if (!check) {
      const now = dayjs().valueOf();
      const data = new bannerSchema({
        banner_id: 1,
        banner_img: 'https://i.ibb.co/VV6bNbZ/banner.png',
        banner_link: 'https://forms.gle/idEW9dzZQdtsdL9n8',
        createdAt: now
      });
      data.save();
      consola.info('Banner Data Initialized.');
    }
  }
}