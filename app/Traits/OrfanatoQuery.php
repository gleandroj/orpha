<?php
/**
 * Created by PhpStorm.
 * User: FG0003
 * Date: 21/10/2016
 * Time: 14:34
 */

namespace App\Traits;


use App\Orfanato;
use App\Scopes\OrfanatoScope;

trait OrfanatoQuery
{
    /**
     * Boot the soft deleting trait for a model.
     *
     * @return void
     */
    public static function bootOrfanatoQuery()
    {
        static::addGlobalScope(new OrfanatoScope());
    }

    /**
     * @return Orfanato
     */
    public function orfanato()
    {
        return $this->belongsTo(Orfanato::class);
    }

    /**
     * Get the name of the column for applying the scope.
     *
     * @return string
     */
    public function getOrfanatoColumn()
    {
        return defined('static::ORFANATO_COLUMN') ? static::ORFANATO_COLUMN : 'orfanato_id';
    }

    /**
     * Get the fully qualified column name for applying the scope.
     *
     * @return string
     */
    public function getQualifiedOrfanatoColumn()
    {
        return $this->getTable().'.'.$this->getOrfanatoColumn();
    }
}