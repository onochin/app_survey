import type {
  LearningRecord,
  LearningRecordMap,
} from "../../types/learningRecord";
import {
  createEmptyLearningRecord,
  hasLearningActivity,
} from "../../utils/learningRecords";

export interface LearningReviewItem {
  readonly id: string;
  readonly label: string;
  readonly title: string;
}

interface LearningReviewPanelProps {
  readonly items: readonly LearningReviewItem[];
  readonly records: LearningRecordMap;
  readonly storageError: string | null;
  readonly onOpenItem: (itemId: string) => void;
}

function statusText(record: LearningRecord): string {
  if (record.needsReview) {
    return "要復習";
  }

  if (record.isUnderstood) {
    return "理解済み";
  }

  return "学習中";
}

function LearningReviewPanel({
  items,
  records,
  storageError,
  onOpenItem,
}: LearningReviewPanelProps) {
  const understoodCount = items.filter(
    (item) => records[item.id]?.isUnderstood,
  ).length;
  const reviewCount = items.filter(
    (item) => records[item.id]?.needsReview,
  ).length;
  const recordedItems = items
    .filter((item) =>
      hasLearningActivity(
        records[item.id] ?? createEmptyLearningRecord(),
      ),
    )
    .sort((left, right) => {
      const leftReview = records[left.id]?.needsReview ? 1 : 0;
      const rightReview = records[right.id]?.needsReview ? 1 : 0;
      return rightReview - leftReview;
    });

  return (
    <section
      className="learning-review-panel"
      aria-labelledby="learning-review-title"
    >
      <div className="learning-review-heading">
        <div>
          <p className="card-kicker">REVIEW LIST</p>
          <h2 id="learning-review-title">学習メモ・復習リスト</h2>
        </div>
        <p>
          「あとで復習」を付けた項目を上に表示します。
        </p>
      </div>

      <dl className="learning-review-summary">
        <div>
          <dt>理解できた</dt>
          <dd>
            {understoodCount}
            <small> / {items.length}項目</small>
          </dd>
        </div>
        <div>
          <dt>あとで復習</dt>
          <dd>
            {reviewCount}
            <small>項目</small>
          </dd>
        </div>
        <div>
          <dt>記録あり</dt>
          <dd>
            {recordedItems.length}
            <small>項目</small>
          </dd>
        </div>
      </dl>

      {storageError === null ? null : (
        <p className="learning-storage-error" role="alert">
          {storageError}
        </p>
      )}

      {recordedItems.length === 0 ? (
        <div className="learning-review-empty">
          <strong>学習記録はまだありません</strong>
          <p>
            右側の「学習記録」でチェックやメモを入力すると、
            ここへ自動的に表示されます。
          </p>
        </div>
      ) : (
        <ul className="learning-review-list">
          {recordedItems.map((item) => {
            const record =
              records[item.id] ?? createEmptyLearningRecord();

            return (
              <li
                className={record.needsReview ? "needs-review" : ""}
                key={item.id}
              >
                <div className="learning-review-item-heading">
                  <div>
                    <span>{item.label}</span>
                    <h3>{item.title}</h3>
                  </div>
                  <strong>{statusText(record)}</strong>
                </div>

                {record.note.trim().length === 0 ? (
                  <p className="learning-review-no-note">
                    メモはありません。
                  </p>
                ) : (
                  <p className="learning-review-note">{record.note}</p>
                )}

                <div className="learning-review-item-footer">
                  <span>学習回数：{record.practiceCount}回</span>
                  <button
                    onClick={() => onOpenItem(item.id)}
                    type="button"
                  >
                    この項目を開く
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default LearningReviewPanel;
