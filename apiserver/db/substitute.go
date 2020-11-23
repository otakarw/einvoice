package db

import (
	"errors"

	"github.com/go-pg/pg/v10"
	"github.com/go-pg/pg/v10/orm"
	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/apiserver/entity"
)

func NewSubstitutes(ownerId int, substituteIds []int) *[]entity.Substitute {
	substitutes := []entity.Substitute{}
	for _, id := range substituteIds {
		substitutes = append(
			substitutes,
			entity.Substitute{OwnerId: ownerId, SubstituteId: id},
		)
	}
	return &substitutes
}

func (connector *Connector) AddUserSubstitutes(ownerId int, substituteIds []int) ([]int, error) {
	substitutes := NewSubstitutes(ownerId, substituteIds)
	addedSubstituteIds := []int{}
	_, err := connector.Db.Model(substitutes).
		OnConflict("DO NOTHING").
		Returning("substitute_id").
		Insert(&addedSubstituteIds)

	if err != nil {
		log.WithFields(log.Fields{
			"error": err.Error(),
			"ownerId": ownerId,
			"substituteIds": substituteIds,
		}).Warn("db.addSubstitutes")

		pgErr, ok := err.(pg.Error)
		if ok && pgErr.IntegrityViolation() {
			return nil, nil
		} else {
			return nil, err
		}
	}
	return addedSubstituteIds, err
}

func (connector *Connector) RemoveUserSubstitutes(ownerId int, substituteIds []int) ([]int, error) {
	deletedSubstituteIds := []int{}
	_, err := connector.Db.Model(&entity.Substitute{}).
		Where("owner_id = ?", ownerId).
		Where("substitute_id IN (?)", pg.In(substituteIds)).
		Returning("substitute_id").
		Delete(&deletedSubstituteIds)
	if err != nil {
		log.WithFields(log.Fields{
			"error": err.Error(),
			"ownerId": ownerId,
			"substituteIds": substituteIds,
		}).Error("db.removeSubstitutes")

		return nil, err
	}
	return deletedSubstituteIds, err
}

func (connector *Connector) GetUserSubstitutes(ownerId int) ([]int, error) {
	substituteIds := []int{}
	err := connector.Db.Model(&entity.Substitute{}).
		Column("substitute_id").
		Where("owner_id = ?", ownerId).
		Select(&substituteIds)
	if err != nil {
		log.WithFields(log.Fields{
			"error": err.Error(),
			"ownerId": ownerId,
		}).Error("db.getSubstitutes")

		return nil, err
	}
	return substituteIds, err
}

func (connector *Connector) IsValidSubstitute(userId int, ico string) error {
	count, err := connector.Db.Model(&entity.User{}).
		Join("LEFT JOIN substitutes ON owner_id = id").
		Where("slovensko_sk_uri = ?", icoToUri(ico)).
		WhereGroup(func(q *orm.Query) (*orm.Query, error) {
			return q.WhereOr("substitute_id = ?", userId).WhereOr("id = ?", userId), nil
		}).
		Count()

	if err != nil {
		log.WithFields(log.Fields{
			"error":  err.Error(),
			"ico":    ico,
			"userId": userId,
		}).Panic("db.isValidSubstitute.failed")
	}

	if count == 0 {
		return errors.New("You are not permitted to create invoice with this supplier IČO")
	}

	return nil
}
