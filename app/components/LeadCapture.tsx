import RequestForm from "./RequestForm";

type LeadCaptureProps = {
  eyebrow?: string;
  title?: string;
  text?: string;
  id?: string;
};

export default function LeadCapture({
  eyebrow = "Заявка",
  title = "Рассчитаем материалы для вашего объекта",
  text = "Оставьте контакты — специалист Иделеон свяжется с вами, уточнит задачу и подготовит предложение.",
  id = "request",
}: LeadCaptureProps) {
  return (
    <section id={id} className="request">
      <div>
        <p className="label">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      <RequestForm />
    </section>
  );
}
