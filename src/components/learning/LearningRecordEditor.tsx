import type {
  LearningRecord,
  LearningRecordUpdate,
} from "../../types/learningRecord";
import { MAX_LEARNING_NOTE_LENGTH } from "../../utils/learningRecords";

interface LearningRecordEditorProps {
  readonly contentTitle: string;
  readonly record: LearningRecord;
  readonly storageError: string | null;
  readonly onPractice: () => void;
  readonly onUpdate: (update: LearningRecordUpdate) => void;
}

function formatUpdatedAt(updatedAt: string | null): string {
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

function LearningRecordEditor({
  contentTitle,
  record,
  storageError,
  onPractice,
  onUpdate,
}: LearningRecordEditorProps) {
  return (
    <section
      className="learning-record-card card"
      aria-labelledby="learning-record-title"
    >
      <div className="section-title-row">
        <div>
          <p className="card-kicker">MY LEARNING RECORD</p>
          <h2 id="learning-record-title">学習記録</h2>
        </div>
        <span className="learning-save-badge">自動保存</span>
      </div>

      <p className="learning-record-target">{contentTitle}</p>

      <div className="learning-record-checks">
        <label
          className={record.isUnderstood ? "is-checked" : ""}
        >
          <input
            checked={record.isUnderstood}
            onChange={(event) =>
              onUpdate({ isUnderstood: event.target.checked })
            }
            type="checkbox"
          />
          <span>理解できた</span>
        </label>
        <label
          className={record.needsReview ? "needs-review" : ""}
        >
          <input
            checked={record.needsReview}
            onChange={(event) =>
              onUpdate({ needsReview: event.target.checked })
            }
            type="checkbox"
          />
          <span>あとで復習</span>
        </label>
      </div>

      <label className="learning-note-field">
        <span>
          メモ
          <small>
            {record.note.length}/{MAX_LEARNING_NOTE_LENGTH}
          </small>
        </span>
        <textarea
          maxLength={MAX_LEARNING_NOTE_LENGTH}
          onChange={(event) => onUpdate({ note: event.target.value })}
          placeholder="分からなかった点、覚え方、次回確認することを入力"
          rows={4}
          value={record.note}
        />
      </label>

      <button
        className="record-practice-button"
        onClick={onPractice}
        type="button"
      >
        今回の学習を記録
      </button>

      <dl className="learning-record-meta">
        <div>
          <dt>学習回数</dt>
          <dd>{record.practiceCount}回</dd>
        </div>
        <div>
          <dt>最終記録</dt>
          <dd>{formatUpdatedAt(record.updatedAt)}</dd>
        </div>
      </dl>

      {storageError === null ? (
        <p className="learning-storage-note">
          このURLのブラウザ内に保存しています。
        </p>
      ) : (
        <p className="learning-storage-error" role="alert">
          {storageError}
        </p>
      )}
    </section>
  );
}

export default LearningRecordEditor;
