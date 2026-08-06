import type {
  BasicsLearningItemId,
  BasicsLearningRecord,
  BasicsLearningRecordUpdate,
} from "../learningRecordTypes";
import {
  getBasicsLearningDomSuffix,
  MAX_BASICS_LEARNING_NOTE_LENGTH,
} from "../utils/learningRecords";

interface BasicsLearningRecordEditorProps {
  readonly heading: string;
  readonly itemId: BasicsLearningItemId;
  readonly record: BasicsLearningRecord;
  readonly storageError: string | null;
  readonly targetLabel: string;
  readonly onPractice: () => void;
  readonly onUpdate: (update: BasicsLearningRecordUpdate) => void;
}

export function formatBasicsLearningUpdatedAt(
  updatedAt: string | null,
): string {
  if (updatedAt === null) {
    return "まだ記録されていません";
  }

  const date = new Date(updatedAt);

  if (Number.isNaN(date.getTime())) {
    return "記録日時を確認できません";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function BasicsLearningRecordEditor({
  heading,
  itemId,
  record,
  storageError,
  targetLabel,
  onPractice,
  onUpdate,
}: BasicsLearningRecordEditorProps) {
  const domSuffix = getBasicsLearningDomSuffix(itemId);
  const headingId = `basics-learning-heading-${domSuffix}`;
  const understoodId = `basics-learning-understood-${domSuffix}`;
  const reviewId = `basics-learning-review-${domSuffix}`;
  const noteId = `basics-learning-note-${domSuffix}`;
  const noteCountId = `basics-learning-note-count-${domSuffix}`;

  return (
    <section
      aria-labelledby={headingId}
      className="basics-learning-editor"
      data-item-id={itemId}
      data-testid={`basics-learning-editor-${domSuffix}`}
      id={`basics-learning-editor-${domSuffix}`}
      tabIndex={-1}
    >
      <header className="basics-learning-editor-heading">
        <div>
          <span>MY LEARNING RECORD</span>
          <h3 id={headingId}>{heading}</h3>
          <p>{targetLabel}</p>
        </div>
        <strong className={storageError === null ? "" : "is-screen-only"}>
          {storageError === null ? "自動保存" : "画面内のみ"}
        </strong>
      </header>

      <div className="basics-learning-checks">
        <label
          className={record.isUnderstood ? "is-understood" : ""}
          htmlFor={understoodId}
        >
          <input
            checked={record.isUnderstood}
            id={understoodId}
            onChange={(event) =>
              onUpdate({ isUnderstood: event.target.checked })
            }
            type="checkbox"
          />
          <span>理解できた</span>
        </label>
        <label
          className={record.needsReview ? "needs-review" : ""}
          htmlFor={reviewId}
        >
          <input
            checked={record.needsReview}
            id={reviewId}
            onChange={(event) =>
              onUpdate({ needsReview: event.target.checked })
            }
            type="checkbox"
          />
          <span>あとで復習</span>
        </label>
      </div>

      <label className="basics-learning-note-field" htmlFor={noteId}>
        <span>
          メモ
          <small id={noteCountId}>
            {record.note.length}/{MAX_BASICS_LEARNING_NOTE_LENGTH}
          </small>
        </span>
        <textarea
          aria-describedby={noteCountId}
          id={noteId}
          maxLength={MAX_BASICS_LEARNING_NOTE_LENGTH}
          onChange={(event) => onUpdate({ note: event.target.value })}
          placeholder="分からなかった点や、次に確認することを入力"
          rows={3}
          value={record.note}
        />
      </label>

      <div className="basics-learning-actions">
        <button onClick={onPractice} type="button">
          今回の学習を記録
        </button>
        <dl>
          <div>
            <dt>学習回数</dt>
            <dd>{record.practiceCount}回</dd>
          </div>
          <div>
            <dt>最終記録</dt>
            <dd>{formatBasicsLearningUpdatedAt(record.updatedAt)}</dd>
          </div>
        </dl>
      </div>

      <p className="basics-learning-storage-note">
        {storageError === null
          ? "チェック状態とメモは、このURLのブラウザ内へ自動保存します。学習回数と日時は、上のボタンを押したときだけ更新します。"
          : "保存機能を利用できないため、この画面を開いている間だけ状態を保持します。"}
      </p>
    </section>
  );
}

export default BasicsLearningRecordEditor;
