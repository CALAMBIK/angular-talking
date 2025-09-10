import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgoDate',
})
export class timeAgoDatePipe implements PipeTransform {
  transform(value: string) {
    if (!value) return '';

    const date = new Date(value);
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - date.getTime()) / 1000 - 3600 * 3
    );

    // Определяем интервалы времени
    const intervals = {
      год: 31536000,
      месяц: 2592000,
      неделя: 604800,
      день: 86400,
      час: 3600,
      минута: 60,
      секунда: 1,
    };

    // Находим подходящий интервал
    for (const [unit, seconds] of Object.entries(intervals)) {
      const count = Math.floor(diffInSeconds / seconds);

      if (count >= 1) {
        // Правильное склонение для русского языка
        let unitName = unit;
        if (count === 1) {
          // единственное число
          unitName = this.getSingularUnit(unit);
        } else if (
          count >= 2 &&
          count <= 4 &&
          (unit === 'месяц' ||
            unit === 'день' ||
            unit === 'час' ||
            unit === 'минута' ||
            unit === 'секунда')
        ) {
          // родительный падеж единственного числа для 2-4
          unitName = this.getGenitiveSingular(unit);
        } else {
          // родительный падеж множественного числа
          unitName = this.getGenitivePlural(unit);
        }

        return `${count} ${unitName} назад`;
      }
    }

    return 'только что';
  }

  private getSingularUnit(unit: string): string {
    const units: { [key: string]: string } = {
      год: 'год',
      месяц: 'месяц',
      неделя: 'неделю',
      день: 'день',
      час: 'час',
      минута: 'минуту',
      секунда: 'секунду',
    };
    return units[unit] || unit;
  }

  private getGenitiveSingular(unit: string): string {
    const units: { [key: string]: string } = {
      месяц: 'месяца',
      день: 'дня',
      час: 'часа',
      минута: 'минуты',
      секунда: 'секунды',
    };
    return units[unit] || unit;
  }

  private getGenitivePlural(unit: string): string {
    const units: { [key: string]: string } = {
      год: 'лет',
      месяц: 'месяцев',
      неделя: 'недель',
      день: 'дней',
      час: 'часов',
      минута: 'минут',
      секунда: 'секунд',
    };
    return units[unit] || unit;
  }
}
