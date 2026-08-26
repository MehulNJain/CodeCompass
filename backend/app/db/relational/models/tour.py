"""Documentation §13 — `tours` and `tour_steps`."""

from sqlalchemy import Enum as SAEnum
from sqlalchemy import ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import Persona
from app.db.relational.base import Base, TimestampMixin


class Tour(Base, TimestampMixin):
    __tablename__ = "tours"

    id: Mapped[int] = mapped_column(primary_key=True)
    repository_id: Mapped[int] = mapped_column(
        ForeignKey("repositories.id", ondelete="CASCADE"), index=True
    )
    persona: Mapped[Persona] = mapped_column(
        SAEnum(Persona, name="persona"),
        default=Persona.NEW_CONTRIBUTOR,
        nullable=False,
    )

    repository: Mapped["Repository"] = relationship(back_populates="tours")  # noqa: F821
    steps: Mapped[list["TourStep"]] = relationship(
        back_populates="tour",
        cascade="all, delete-orphan",
        order_by="TourStep.order_index",
    )


class TourStep(Base):
    __tablename__ = "tour_steps"
    __table_args__ = (
        UniqueConstraint("tour_id", "order_index", name="uq_tour_steps_tour_id_order"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    tour_id: Mapped[int] = mapped_column(
        ForeignKey("tours.id", ondelete="CASCADE"), index=True
    )
    order_index: Mapped[int] = mapped_column(nullable=False)
    file_id: Mapped[int] = mapped_column(ForeignKey("files.id", ondelete="CASCADE"))

    # The only generated text in the schema. It comes from M6 and nowhere else.
    explanation: Mapped[str | None] = mapped_column(Text)

    # The citation. An explanation without a line range is unverifiable, which
    # is the thing this project exists to avoid.
    cited_line_start: Mapped[int | None] = mapped_column()
    cited_line_end: Mapped[int | None] = mapped_column()

    # Set by M7 when the cited lines changed after the explanation was written.
    is_stale: Mapped[bool] = mapped_column(default=False, nullable=False)

    tour: Mapped["Tour"] = relationship(back_populates="steps")
