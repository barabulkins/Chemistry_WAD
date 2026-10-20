import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PublishSampleDto {
  @ApiPropertyOptional({
    description: 'Уточненное название образца',
    example: 'Металлический цинк высшей пробы',
  })
  title?: string;

  @ApiPropertyOptional({
    description: 'Подробное описание свойств, условий хранения и испытаний',
    example: 'Высокочистый кристаллический образец. При взаимодействии с соляной кислотой бурно выделяет водород.',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Массовая доля примесей (%, в 1 кг)',
    example: 1.25,
  })
  impurities_percent?: number;

  @ApiPropertyOptional({
    description: 'Объем выделившегося газа (мл из 1 кг)',
    example: 350,
  })
  gas_volume?: number;
}
